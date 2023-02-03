import type {ServerSettings} from '../types'
import {type Logger} from '@applitools/logger'
import {type Driver} from '@applitools/driver'
import {type Renderer, type AndroidSnapshot, type IOSSnapshot} from '@applitools/ufg-client'

export type VHSesSettings = ServerSettings & {renderers: Renderer[]; waitBeforeCapture?: number}

export async function takeVHSes<TDriver extends Driver<unknown, unknown, unknown, unknown>>({
  driver,
  settings,
  hooks,
  logger,
}: {
  driver: TDriver
  settings: VHSesSettings
  hooks?: {beforeSnapshots?(): void | Promise<void>; beforeEachSnapshot?(): void | Promise<void>}
  logger: Logger
}): Promise<AndroidSnapshot[] | IOSSnapshot[]> {
  logger.log('taking VHS')

  if (!driver.isAndroid && !driver.isIOS) {
    throw new Error('cannot take VHS on mobile device other than iOS or Android')
  }

  await hooks?.beforeSnapshots?.()

  const trigger = await driver.waitFor(
    driver.isAndroid
      ? {type: 'xpath', selector: `//android.widget.Button[@content-desc="UFG_TriggerArea"]`}
      : {type: 'accessibility id', selector: 'UFG_TriggerArea'},
    {timeout: 30_000},
  )

  if (!trigger) throw new Error('Trigger element could not be found')

  if (driver.isAndroid) {
    const apiKeyInput = await driver.element({
      type: 'xpath',
      selector: `//android.widget.EditText[@content-desc="UFG_Apikey"]`,
    })
    if (apiKeyInput) {
      // in case 'apiKeyInput' does not exist, it means it was already triggered on previous cycle
      // this condition is to avoid re-sending 'inputJson' multiple times
      const inputString = JSON.stringify({
        serverUrl: settings.serverUrl,
        apiKey: settings.apiKey,
        proxy: settings.proxy && transformProxy(settings.proxy),
      })
      logger.log('sending API key to UFG lib', inputString)
      await apiKeyInput.type(inputString)
      const ready = await driver.element({
        type: 'xpath',
        selector: `//android.widget.Button[@content-desc="UFG_ApikeyReady"]`,
      })
      if (!ready) throw new Error('Api key readiness element could not be found')
      await ready.click()
    } else {
      logger.log('UFG_Apikey was skipped')
    }
  }

  await trigger.click() // TODO handle stale element exception and then find the trigger again and click it

  let label = await driver.waitFor(
    driver.isAndroid
      ? {type: 'xpath', selector: `//android.widget.TextView[@content-desc="UFG_SecondaryLabel"]`}
      : {type: 'accessibility id', selector: 'UFG_SecondaryLabel'},
    {timeout: 10_000},
  )
  if (!label) {
    // This might happen if the tap on the trigger area didn't happen due to Appium bug. So we try to find the trigger again and if it's present, we'll tap it.
    // If the trigger area is not present, then we're probably at the middle of taking the VHS - give it 50 seconds more until we give up
    logger.log('UFG_SecondaryLabel was not found after 10 seconds, trying to click UFG_TriggerArea again')
    const triggerRetry = await driver.waitFor(
      driver.isAndroid
        ? {type: 'xpath', selector: `//android.widget.Button[@content-desc="UFG_TriggerArea"]`}
        : {type: 'accessibility id', selector: 'UFG_TriggerArea'},
      {timeout: 30_000},
    )
    if (triggerRetry) {
      logger.log('UFG_TriggerArea was found on retry. clicking it.')
      await triggerRetry.click()
    } else {
      logger.log('UFG_TriggerArea was NOT found on retry. Probably VHS is being taken.')
    }
    label = await driver.waitFor(
      driver.isAndroid
        ? {type: 'xpath', selector: `//android.widget.TextView[@content-desc="UFG_SecondaryLabel"]`}
        : {type: 'accessibility id', selector: 'UFG_SecondaryLabel'},
      {timeout: 50_000},
    )

    if (!label) {
      logger.log('UFG_SecondaryLabel was not found eventually. Giving up.')
      throw new Error('Secondary label element could not be found')
    }
  }
  const info = JSON.parse(await label.getText())
  logger.log('VHS info', info)

  if (info.error) throw new Error(`Error while taking VHS - ${info.error}`)

  let vhs = ''
  if (driver.isIOS) {
    const label = await driver.element({type: 'accessibility id', selector: 'UFG_Label'})
    if (!label) throw new Error('VHS label element could not be found')
    vhs = await label.getText()
  } else if (info.mode === 'labels') {
    const labels = [
      await driver.element({type: 'xpath', selector: `//android.widget.TextView[@content-desc="UFG_Label_0"]`}),
      await driver.element({type: 'xpath', selector: `//android.widget.TextView[@content-desc="UFG_Label_1"]`}),
      await driver.element({type: 'xpath', selector: `//android.widget.TextView[@content-desc="UFG_Label_2"]`}),
    ]

    if (labels.some(label => !label)) throw new Error('VHS label element could not be found')

    for (let chunk = 0; chunk < info.partsCount / labels.length; ++chunk) {
      for (let label = 0; label < Math.min(labels.length, info.partsCount - chunk * labels.length); ++label) {
        vhs += await labels[label]!.getText()
      }
      if (chunk * labels.length < info.partsCount) await trigger.click()
    }
  } else if (info.mode === 'network') {
    // do nothing
  } else {
    throw new Error(`unknown mode for android: ${info.mode}`)
  }

  const clear = await driver.waitFor(
    driver.isAndroid
      ? {type: 'xpath', selector: `//android.widget.Button[@content-desc="UFG_ClearArea"]`}
      : {type: 'accessibility id', selector: 'UFG_ClearArea'},
    {timeout: 30_000},
  )
  if (!clear) throw new Error('Clear element could not be found')
  await clear.click()

  let snapshot: AndroidSnapshot | IOSSnapshot

  if (driver.isAndroid) {
    snapshot = {
      platformName: 'android',
      vhsType: info.flavorName,
      vhsHash: {
        hashFormat: 'sha256',
        hash: info.vhsHash,
        contentType: `x-applitools-vhs/${info.flavorName}`,
      },
    }
  } else {
    snapshot = {
      platformName: 'ios',
      resourceContents: {
        vhs: {
          value: Buffer.from(vhs, 'base64'),
          type: 'x-applitools-vhs/ios',
        },
      },
      vhsCompatibilityParams: {
        UIKitLinkTimeVersionNumber: info.UIKitLinkTimeVersionNumber,
        UIKitRunTimeVersionNumber: info.UIKitRunTimeVersionNumber,
      },
    }
  }

  return Array(settings.renderers.length).fill(snapshot)
}

function transformProxy(proxy: any) {
  const url = new URL(proxy.url)
  const transformedProxy = {
    protocol: url.protocol,
    host: url.hostname,
    port: url.port,
  } as any
  if (proxy.username) {
    transformedProxy.auth = {username: proxy.username, password: proxy.password}
  } else if (url.username) {
    transformedProxy.auth = {username: url.username, password: proxy.password}
  }
  return transformedProxy
}
