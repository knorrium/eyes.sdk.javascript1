module.exports = (req, res, next) => {
  if (req.query.checkCookie) {
    if (req.cookies[req.query.checkCookie.name] !== req.query.checkCookie.value) {
      return res.sendStatus(403)
    }
  }

  if (req.query.writeCookie) {
    res.cookie(req.query.writeCookie.name, req.query.writeCookie.value, req.query.writeCookie.options)
  }

  next()
}
