export function isInvalidUrl(url) {
  return (
    (/^http\:/.test(url) && !/^http\:\/\/localhost/.test(url) && !/^http\:\/\/127\.0\.0\.1/.test(url)) ||
    /^chrome\:/.test(url)
  )
}
