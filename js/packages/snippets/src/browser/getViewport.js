function getViewport() {
  let width = 0
  let height = 0
  if (window.innerHeight) {
    height = window.innerHeight
  } else if (document.documentElement && document.documentElement.clientHeight) {
    height = document.documentElement.clientHeight
  } else if (document.body && document.body.clientHeight) {
    height = document.body.clientHeight
  }
  if (window.innerWidth) {
    width = window.innerWidth
  } else if (document.documentElement && document.documentElement.clientWidth) {
    width = document.documentElement.clientWidth
  } else if (document.body && document.body.clientWidth) {
    width = document.body.clientWidth
  }

  return {
    viewportSize: {width, height},
    pixelRatio: window.devicePixelRatio,
    viewportScale: window.visualViewport && window.visualViewport.scale,
    orientation: window.screen && window.screen.orientation && window.screen.orientation.type.replace(/-primary$/, ''),
  }
}

module.exports = getViewport
