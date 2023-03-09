/* global Node */
function eyesCheckMapValues({openToCheckSettingsArgs, args, refer, appliConfFile}) {
  if (typeof args === `string`) {
    args = {tag: args}
  }
  args = {...openToCheckSettingsArgs, ...args}
  if (typeof args.waitBeforeCapture !== 'number') args.waitBeforeCapture = appliConfFile.waitBeforeCapture
  let accessibilitySettings = args.accessibilitySettings || appliConfFile.accessibilityValidation

  const mappedValues = [
    'tag',
    'scriptHooks',
    'ignore',
    'floating',
    'strict',
    'layout',
    'content',
    'accessibility',
    'region',
    'selector',
    'element',
  ]

  let regionSettings = {}
  let shadowDomSettings = {}

  let renderers = args.renderers || args.browser || appliConfFile.browser
  if (renderers) {
    if (Array.isArray(renderers)) {
      for (const [index, value] of renderers.entries()) {
        renderers[index] = fillDefaultBrowserName(value)
      }
    } else {
      renderers = [fillDefaultBrowserName(renderers)]
    }
  }

  const checkSettings = {
    name: args.tag,
    hooks: args.scriptHooks,
    ignoreRegions: convertPaddedRegion(args.ignore),
    floatingRegions: convertFloatingRegion(args.floating),
    strictRegions: convertPaddedRegion(args.strict),
    layoutRegions: convertPaddedRegion(args.layout),
    contentRegions: convertPaddedRegion(args.content),
    accessibilityRegions: convertAccessabilityRegions(args.accessibility),
    renderers,
  }
  if (args.variationGroupId) {
    checkSettings.userCommandId = args.variationGroupId
  }
  if (args.accessibilitySettings) {
    checkSettings.accessibilitySettings = accessibilitySettings
  }

  if (args.target === 'region') {
    if (!Array.isArray(args.selector)) {
      if (args.element) {
        if (isHTMLElement(args.element)) {
          regionSettings = {
            region: Object.assign(refer.ref(args.element), {type: 'element'}),
          }
        } else {
          // JQuery element
          regionSettings = {
            region: Object.assign(refer.ref(args.element[0]), {type: 'element'}),
          }
        }
      } else if (
        args.region &&
        args.region.hasOwnProperty('top') &&
        args.region.hasOwnProperty('left') &&
        args.region.hasOwnProperty('width') &&
        args.region.hasOwnProperty('height')
      ) {
        regionSettings = {
          region: {
            y: args.region.top,
            x: args.region.left,
            width: args.region.width,
            height: args.region.height,
          },
        }
      } else if (!args.hasOwnProperty('selector')) {
        regionSettings = {
          region: args.region,
        }
      } else {
        regionSettings = {
          region: args.selector,
        }
      }
    } else {
      const selectors = args.selector
      for (let i = selectors.length - 1; i > -1; i--) {
        if (i === selectors.length - 1) {
          shadowDomSettings['shadow'] = selectors[i].selector
        } else {
          const prevSettings = Object.assign({}, shadowDomSettings)
          shadowDomSettings['selector'] = selectors[i].selector
          if (!prevSettings.hasOwnProperty('selector')) {
            shadowDomSettings['shadow'] = prevSettings.shadow
          } else {
            shadowDomSettings['shadow'] = prevSettings
          }
        }
      }
      regionSettings = {region: shadowDomSettings}
    }
  }

  for (const val of mappedValues) {
    if (args.hasOwnProperty(val)) {
      delete args[val]
    }
  }

  return Object.assign({}, checkSettings, regionSettings, args)

  // #region helper functions

  function convertPaddedRegion(regions) {
    if (!regions) return
    if (!Array.isArray(regions)) regions = [regions]
    let resRegions = []
    for (const region of regions) {
      if (region.element || isHTMLElement(region) || region.jquery) {
        if (region.padding || region.regionId) {
          let currRefElements = refElements(region.element)
          for (const refElement of currRefElements) {
            let curr = {region: refElement}
            if (region.padding) {
              curr.padding = region.padding
            }
            if (region.regionId) {
              curr.regionId = region.regionId
            }
            resRegions.push(curr)
          }
        } else {
          resRegions = [...resRegions, ...refElements(region)]
        }
      } else {
        if (region.selector && !region.type) {
          region.region = region.selector
          delete region.selector
        }
        resRegions.push(region)
      }
    }
    return resRegions
  }

  function convertAccessabilityRegions(accessibilityRegions) {
    if (!accessibilityRegions) return accessibilityRegions
    if (!Array.isArray(accessibilityRegions)) {
      accessibilityRegions = [accessibilityRegions]
    }
    const accessibility = []

    accessibilityRegions.map(region => {
      const accessabilityRegion = {
        type: region.accessibilityType,
      }
      if (region.hasOwnProperty('selector')) {
        accessabilityRegion.region = region.selector
        accessibility.push(accessabilityRegion)
      } else if (region.hasOwnProperty('element')) {
        const elements = refElements(region.element)
        delete region['element']
        for (const element of elements) {
          accessibility.push(Object.assign({}, region, accessabilityRegion, {region: element}))
        }
      } else if (region.hasOwnProperty('region')) {
        region.type = region.region.accessibilityType
        delete region.region.accessibilityType
        accessibility.push(region)
      } else {
        accessabilityRegion.region = {
          y: region.top,
          x: region.left,
          width: region.width,
          height: region.height,
        }
        accessibility.push(accessabilityRegion)
      }
    })

    return accessibility
  }

  function convertFloatingRegion(floatingRegions) {
    if (!floatingRegions) return floatingRegions
    if (!Array.isArray(floatingRegions)) {
      floatingRegions = [floatingRegions]
    }
    const floating = []

    for (const region of floatingRegions) {
      const floatingRegion = {
        offset: {
          bottom: region.maxDownOffset || 0,
          left: region.maxLeftOffset || 0,
          top: region.maxUpOffset || 0,
          right: region.maxRightOffset || 0,
        },
      }
      if (region.hasOwnProperty('selector')) {
        floatingRegion.region = region.selector
        floating.push(floatingRegion)
      } else if (region.hasOwnProperty('element')) {
        const elements = refElements(region.element)
        delete region['element']
        for (const element of elements) {
          floating.push(Object.assign({}, region, floatingRegion, {region: element}))
        }
      } else if (region.hasOwnProperty('region')) {
        floating.push({offset: floatingRegion.offset, ...region})
      } else {
        floatingRegion.region = {
          y: region.top,
          x: region.left,
          width: region.width,
          height: region.height,
        }
        floating.push(floatingRegion)
      }
    }
    return floating
  }

  function refElements(regions) {
    if (!regions) return regions
    if (!Array.isArray(regions)) regions = [regions]
    const elements = []
    for (const region of regions) {
      if (isHTMLElement(region)) {
        elements.push(Object.assign(refer.ref(region), {type: 'element'}))
      } else if (region.jquery) {
        region.each(function () {
          // there's a small chance that `this` is not an HTML element. So we just verify it.
          elements.push(isHTMLElement(this) ? Object.assign(refer.ref(this), {type: 'element'}) : this)
        })
      } else {
        elements.push(region)
      }
    }
    return elements
  }

  // #endregion
}

function isHTMLElement(element) {
  // Avoiding instanceof here since the element might come from an iframe, and `instanceof HTMLElement` would fail.
  // This check looks naive, but if anyone passes something like {nodeType: 1} as a region, then I'm fine with them crashing :)
  return element.nodeType && element.nodeType === Node.ELEMENT_NODE
}

function fillDefaultBrowserName(browser) {
  if (!browser.iosDeviceInfo && !browser.chromeEmulationInfo) {
    if (!browser.name) {
      browser.name = 'chrome'
    }
    if (browser.deviceName) {
      browser = {chromeEmulationInfo: browser}
    }
    return browser
  } else {
    return browser
  }
}

module.exports = {eyesCheckMapValues}
