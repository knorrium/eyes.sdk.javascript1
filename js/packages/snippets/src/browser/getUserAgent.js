const EYES_NAMESPACE = '__EYES__APPLITOOLS__'
const USER_AGENT_KEY = 'userAgent'
window[EYES_NAMESPACE] = window[EYES_NAMESPACE] || {}

function getUserAgent() {
  try {
    if (window[EYES_NAMESPACE][USER_AGENT_KEY]) {
      const state = window[EYES_NAMESPACE][USER_AGENT_KEY]
      if (state.status !== 'WIP') delete window[EYES_NAMESPACE][USER_AGENT_KEY]
      return JSON.stringify(state)
    } else {
      if (window.navigator.userAgentData) {
        window[EYES_NAMESPACE][USER_AGENT_KEY] = {status: 'WIP'}
        window.navigator.userAgentData
          .getHighEntropyValues(['brands', 'platform', 'platformVersion', 'model'])
          .then(userAgentData => {
            window[EYES_NAMESPACE][USER_AGENT_KEY] = {
              status: 'SUCCESS',
              value: {legacy: window.navigator.userAgent, ...userAgentData},
            }
          })
          .catch(error => {
            window[EYES_NAMESPACE][USER_AGENT_KEY] = {status: 'ERROR', error: error.message}
          })
      } else {
        window[EYES_NAMESPACE][USER_AGENT_KEY] = {status: 'SUCCESS', value: window.navigator.userAgent}
      }
      return JSON.stringify(window[EYES_NAMESPACE][USER_AGENT_KEY])
    }
  } catch (error) {
    window[EYES_NAMESPACE][USER_AGENT_KEY] = {status: 'ERROR', error: error.message}
    return JSON.stringify(window[EYES_NAMESPACE][USER_AGENT_KEY])
  }
}

module.exports = getUserAgent
