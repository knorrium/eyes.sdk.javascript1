function getChildFramesInfo() {
  return getChildFrameInfoRecursion()

  function getChildFrameInfoRecursion(root) {
    root = root || document
    const frames = []
    root.querySelectorAll('frame, iframe').forEach(iframe => frames.push([iframe, !iframe.contentDocument, iframe.src]))
    const framesInShadowRoot = Array.prototype.filter
      .call(root.querySelectorAll('*'), element => element.shadowRoot)
      .map(element => getChildFrameInfoRecursion(element.shadowRoot))
    return frames.concat(...framesInShadowRoot)
  }
}

module.exports = getChildFramesInfo
