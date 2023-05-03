function prepareTakeDomSnapshotsSettings({config, options}) {
  let result = {...options};
  result.layoutBreakpoints =
    result.layoutBreakpoints !== undefined ? result.layoutBreakpoints : config.layoutBreakpoints;
  result.disableBrowserFetching =
    result.disableBrowserFetching !== undefined
      ? result.disableBrowserFetching
      : config.disableBrowserFetching;
  return result;
}

module.exports = {
  prepareTakeDomSnapshotsSettings,
};
