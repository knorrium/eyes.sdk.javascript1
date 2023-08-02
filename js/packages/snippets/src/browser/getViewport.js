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

  let orientation
  if (window.screen && window.screen.orientation) {
    orientation = window.screen.orientation.type.replace(/-primary$/, '')
  } else if (window.orientation != null) {
    if (window.orientation === 0) orientation = 'portrait'
    else if (window.orientation === 180) orientation = 'portrait-secondary'
    else if (window.orientation === 90) orientation = 'landscape'
    else if (window.orientation === -90) orientation = 'landscape-secondary'
  }

  return {
    viewportSize: {width, height},
    pixelRatio: window.devicePixelRatio,
    viewportScale: window.visualViewport && window.visualViewport.scale,
    orientation,
  }
}

module.exports = getViewport
