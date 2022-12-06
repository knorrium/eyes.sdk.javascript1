function cleanupElementIds([elements]) {
  elements.forEach(element => {
    element.removeAttribute('data-applitools-selector')
    if (element.getRootNode) {
      for (
        let root = element.getRootNode();
        root !== document && root.constructor && root.constructor.name === 'ShadowRoot';
        root = root.host.getRootNode()
      ) {
        root.host.removeAttribute('data-applitools-selector')
      }
    }
  })
}

module.exports = cleanupElementIds
