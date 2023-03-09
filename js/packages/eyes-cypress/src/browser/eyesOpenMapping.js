const batchPropertiesRetriever = (args, appliConfFile) => {
  return function (prop, nestedProp) {
    nestedProp = nestedProp || prop
    if (args.hasOwnProperty(prop)) {
      return args[prop]
    } else if (args.batch && args.batch.hasOwnProperty(nestedProp)) {
      return args.batch[nestedProp]
    } else if (appliConfFile.hasOwnProperty(prop)) {
      return appliConfFile[prop]
    } else if (appliConfFile.batch && appliConfFile.batch.hasOwnProperty(nestedProp)) {
      return appliConfFile.batch[nestedProp]
    }
    return undefined
  }
}
function eyesOpenMapValues({args, appliConfFile, testName, shouldUseBrowserHooks}) {
  const batchProperties = batchPropertiesRetriever(args, appliConfFile)
  const batch = {
    id: batchProperties('batchId', 'id'),
    name: batchProperties('batchName', 'name'),
    sequenceName: batchProperties('batchSequenceName', 'sequenceName'),
    notifyOnCompletion: batchProperties('notifyOnCompletion'),
    properties:
      (args.batch ? args.batch.properties : undefined) ||
      (appliConfFile.batch ? appliConfFile.batch.properties : undefined),
  }
  for (let prop in batch) {
    if (typeof batch[prop] === 'undefined') {
      delete batch[prop]
    }
  }

  const mappedValues = [
    'accessibilityValidation',
    'browser',
    'useDom',
    'matchLevel',
    'enablePatterns',
    'ignoreDisplacements',
    'ignoreCaret',
    'batchName',
    'batchId',
    'batchSequenceName',
  ]

  const defaultMatchSettings = {
    matchLevel: args.matchLevel || appliConfFile.matchLevel,
    ignoreCaret: args.ignoreCaret || appliConfFile.ignoreCaret,
    useDom: args.useDom || appliConfFile.useDom,
    enablePatterns: args.enablePatterns || appliConfFile.enablePatterns,
    ignoreDisplacements: args.ignoreDisplacements || appliConfFile.ignoreDisplacements,
  }

  const appliConfFileCopy = {...appliConfFile}
  for (const val of mappedValues) {
    if (args.hasOwnProperty(val)) {
      delete args[val]
    }
    if (appliConfFileCopy.hasOwnProperty(val)) {
      delete appliConfFileCopy[val]
    }
  }

  const mappedArgs = {
    ...defaultMatchSettings,
    ...args,
    batch,
  }
  if (typeof args.viewportSize !== 'undefined' || typeof args.environment !== 'undefined') {
    mappedArgs.environment = {viewportSize: args.viewportSize, ...args.environment}
  }

  return Object.assign({testName, keepBatchOpen: !shouldUseBrowserHooks}, appliConfFileCopy, mappedArgs)
}

function eyesOpenToCheckMapValues(args) {
  const {browser, waitBeforeCapture, layoutBreakpoints, accessibilityValidation} = args

  const openToCheckSettingsArgs = {
    browser,
    waitBeforeCapture,
    layoutBreakpoints,
  }

  if (accessibilityValidation) {
    const {level, guidelinesVersion} = accessibilityValidation
    openToCheckSettingsArgs.accessibilitySettings = {
      level,
      version: guidelinesVersion,
    }
  }
  return openToCheckSettingsArgs
}

module.exports = {eyesOpenMapValues, eyesOpenToCheckMapValues}
