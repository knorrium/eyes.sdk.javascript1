import {spec} from '@applitools/spec-driver-browser-extension'
import {Driver} from '@applitools/driver'
import {takeScreenshot} from '@applitools/screenshoter'
import {makeLogger} from '@applitools/logger'
import {isInvalidUrl} from './utils/is-invalid-url'
const q = []

async function main() {
  log('extension icon clicked')

  // pre-init (for scope)
  const targets = await makeWindowTargets()
  const {isFullPage, isCss} = await chrome.storage.local.get(['isFullPage', 'isCss'])

  if (isInvalidUrl(targets.currentUrl)) {
    log('running on an unsupported page, skipping execution')
    return
  }
  if (q.length) {
    log('screenshot in progress, notifying user and doing nothing')
    sendNotification({
      title: 'Screeenshot capture in progress',
      message: 'Please do not interact with browser window while image capture is in progress',
    })
    return
  }
  try {
    log(`preparing to take screenshot`)
    sendNotification({
      title: 'Screeenshot capture in progress',
      message: 'Please do not interact with browser window while image capture is in progress',
    })
    await showDisabledIcon(targets.activeTab)
    await setInProgressTooltip(targets.activeTab)
    // init
    q.push({isFullPage, isCss})
    const driver = await new Driver({
      driver: targets.driver,
      spec,
      logger: makeLogger(),
      customConfig: {},
    }).init()

    // do the thing
    const screenshot = await captureScreenshot(driver, {
      fully: !!isFullPage,
      scrollingMode: !!isCss ? 'css' : 'scroll',
    })

    // cleanup
    log('sending screenshot to the content script to store in the system clipboard')
    await chrome.tabs.sendMessage(targets.activeTab, {screenshot})
    log('notifying the user of completion')
    clearNotifications()
    sendNotification({
      title: 'Screeenshot captured',
      message: 'Image captured and saved to your system clipboard',
    })
    await setDoneTooltip(targets.activeTab)
    await new Promise(res => setTimeout(res, 5000))
    clearNotifications()
  } finally {
    log('clearing queue')
    if (q.length) q.pop()
    await setEnabledTooltip(targets.activeTab)
    await showEnabledIcon(targets.activeTab)
    await new Promise(res => setTimeout(res, 5000))
    log('done!')
  }
}

async function captureScreenshot(driver, screenshotOptions) {
  log('capturing screenshot with', screenshotOptions)
  const {image} = await takeScreenshot({driver, ...screenshotOptions})
  const screenshot = image && (await image.toPng())
  log('screenshot taken!', screenshot)
  return Buffer.from(screenshot).toString('base64')
}

function clearNotifications() {
  try {
    chrome.notifications.getAll(notifications => {
      Object.keys(notifications).forEach(notification => {
        log('clearing notification', notification)
        chrome.notifications.clear(notification)
      })
    })
  } catch (error) {
    console.error(error)
  }
}

function log(...messages) {
  console.log('[screenshoter-ext]', ...messages)
}

async function makeWindowTargets() {
  const [focusedWindow] = await chrome.tabs.query({active: true, currentWindow: true})
  log('making window targets from', focusedWindow)
  const targets = {
    driver: {
      tabId: focusedWindow.id,
      windowId: focusedWindow.windowId,
    },
    debugger: {
      tabId: focusedWindow.id,
    },
    activeTab: focusedWindow.id,
    currentUrl: focusedWindow.url,
  }
  return targets
}

function sendNotification({title, message}) {
  try {
    chrome.notifications.create({
      type: 'basic',
      title,
      message,
      iconUrl: 'assets/ChromeExt_80_LightBG.png',
      requireInteraction: true,
    })
  } catch (error) {
    console.error(error)
  }
}

async function setDisabledTooltip(tabId) {
  await chrome.action.setTitle({
    tabId,
    title: 'Unable to capture screenshots on HTTP websites',
  })
}

async function setEnabledTooltip(tabId) {
  await chrome.action.setTitle({
    tabId,
    title: 'Click to capture screenshot to system clipboard',
  })
}

async function setInProgressTooltip(tabId) {
  await chrome.action.setTitle({tabId, title: 'Screeenshot capture in progress'})
}

async function setDoneTooltip(tabId) {
  await chrome.action.setTitle({tabId, title: 'Screenshot saved to system clipboard'})
}

function setupContextMenu({isFullPage, isCss}) {
  if (isFullPage === undefined) {
    isFullPage = true
    chrome.storage.local.set({isFullPage})
  }
  if (isCss === undefined) {
    isCss = true
    chrome.storage.local.set({isCss})
  }
  log('creating context menus', {isFullPage, isCss})
  chrome.contextMenus.removeAll(() => {
    try {
      const parent = chrome.contextMenus.create({id: 'screenshoter', title: 'Applitools Centra Screenshot Capture'})
      chrome.contextMenus.create({
        id: 'capture-fullpage',
        parentId: parent,
        type: 'radio',
        title: 'Capture full page',
        checked: !!isFullPage,
      })
      chrome.contextMenus.create({
        id: 'capture-viewport',
        parentId: parent,
        type: 'radio',
        title: 'Capture viewport',
        checked: !isFullPage,
      })
      chrome.contextMenus.create({id: 'stitch-separator', parentId: parent, type: 'separator'})
      chrome.contextMenus.create({
        id: 'stitch-mode-css',
        parentId: parent,
        type: 'radio',
        title: 'Stitch with CSS',
        checked: !!isCss,
      })
      chrome.contextMenus.create({
        id: 'stitch-mode-scroll',
        parentId: parent,
        type: 'radio',
        title: 'Stitch with scroll',
        checked: !isCss,
      })
    } catch (error) {
      console.error(error)
    }
  })
}

async function showEnabledIcon(tabId) {
  await chrome.action.setIcon({tabId, path: 'assets/ChromeExt_32LightBG.png'})
}

async function showDisabledIcon(tabId) {
  await chrome.action.setIcon({tabId, path: 'assets/ChromeExt_32LightBG_processing.png'})
}

function updateContextMenu(info, _tab) {
  const {menuItemId: selectedItem} = info
  const captureMode = {}
  if (selectedItem === 'capture-fullpage') captureMode.isFullPage = true
  else if (selectedItem === 'capture-viewport') captureMode.isFullPage = false
  else if (selectedItem === 'stitch-mode-css') captureMode.isCss = true
  else if (selectedItem === 'stitch-mode-scroll') captureMode.isCss = false
  if (captureMode.isFullPage) {
    chrome.contextMenus.update('capture-fullpage', {checked: !!captureMode.isFullPage})
    chrome.contextMenus.update('capture-viewport', {checked: !captureMode.isFullPage})
  }
  if (captureMode.isCss) {
    chrome.contextMenus.update('stitch-mode-css', {checked: !!captureMode.isCss})
    chrome.contextMenus.update('stitch-mode-scroll', {checked: !captureMode.isCss})
  }
  chrome.storage.local.set(captureMode)
  log('updated capture mode', captureMode)
}

chrome.storage.local.get(['isFullPage', 'isCss'], setupContextMenu)
chrome.contextMenus.onClicked.addListener(updateContextMenu)
chrome.action.onClicked.addListener(main)
chrome.runtime.onMessage.addListener(async function (msg, sender, sendResponse) {
  if (msg.action === 'disableIcon') {
    await showDisabledIcon(sender.tab.id)
    await setDisabledTooltip(sender.tab.id)
  }
  return sendResponse(true)
})
