import browser from 'webextension-polyfill'
import {makeRefer} from '@applitools/spec-driver-browser-extension'
import {makeMessenger} from './messenger'

window.refer = makeRefer({
  check: element => element instanceof Node,
  validate: element => {
    if (!element || !element.isConnected) {
      throw new Error('StaleElementReferenceError')
    }
  },
})

const frameMessenger = makeMessenger({
  onMessage: fn => window.addEventListener('message', ({data}) => data.isApplitools && fn(data)),
  sendMessage: data => window.postMessage({...data, isApplitools: true}, '*'),
})

const backgroundMessenger = makeMessenger({
  onMessage: fn => browser.runtime.onMessage.addListener(message => fn(message)),
  sendMessage: message => browser.runtime.sendMessage(message),
})

// NOTE: Listen for one single command triggered from childContext in spec driver
// This is a workaround to get frameId of cross origin iframe
frameMessenger.on('*', (_, type) => backgroundMessenger.emit(type))

// NOTE: Listen for events initiated by the background script
backgroundMessenger.on('*', async (payload, name) => apiMessenger.emit(name, payload))
