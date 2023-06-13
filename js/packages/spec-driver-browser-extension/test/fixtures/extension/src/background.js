import browser from 'webextension-polyfill'
import * as spec from '../../../../dist'

globalThis.browser = browser
globalThis.spec = spec
