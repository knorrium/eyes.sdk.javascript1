import {makeRefer} from '@applitools/spec-driver-browser-extension'
import {isInvalidUrl} from './utils/is-invalid-url'

function log(...messages) {
  console.log('[screenshoter-ext]', ...messages)
}

window.refer = makeRefer({
  check: element => element instanceof Node,
  validate: element => {
    if (!element || !element.isConnected) {
      throw new Error('StaleElementReferenceError')
    }
  },
})

chrome.runtime.onMessage.addListener(async function (msg) {
  log('msg received from background script', msg)
  if (msg.screenshot) {
    try {
      const fetchResult = await fetch(`data:image/png;base64,${msg.screenshot}`)
      const imageBlob = await fetchResult.blob()
      log('image blob created', imageBlob)
      log('writing to system clipboard')
      await navigator.clipboard.write([
        new ClipboardItem({
          'image/png': imageBlob,
        }),
      ])
    } catch (error) {
      console.error(error)
    }
    log('done!')
  }
})

if (isInvalidUrl(document.location.href)) chrome.runtime.sendMessage({action: 'disableIcon'})
