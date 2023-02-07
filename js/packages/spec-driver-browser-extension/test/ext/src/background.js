const browser = require('webextension-polyfill')
const {spec} = require('@applitools/spec-driver-browser-extension')

globalThis.browser = browser
globalThis.spec = spec
