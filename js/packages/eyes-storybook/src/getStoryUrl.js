'use strict';
const getIframeUrl = require('./getIframeUrl');

function getStoryUrl({name, kind, parameters, id}, baseUrl, isVersion7) {
  let storyUrl = getIframeUrl(baseUrl);
  if (!isVersion7) {
    storyUrl += `&selectedKind=${encodeURIComponent(kind)}`;
    storyUrl += `&selectedStory=${encodeURIComponent(name)}`;
  } else {
    storyUrl += `&path=/story/${encodeURIComponent(id)}`;
  }

  const queryParams = parameters && parameters.eyes && parameters.eyes.queryParams;
  if (queryParams) {
    storyUrl += `&eyes-query-params=${Object.keys(queryParams).join(',')}`;
    for (const [name, value] of Object.entries(queryParams)) {
      storyUrl += `&${name}=${encodeURIComponent(value)}`;
    }
  }

  return storyUrl;
}

module.exports = getStoryUrl;
