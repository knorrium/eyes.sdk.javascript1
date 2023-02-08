module.exports = (req, res, next) => {
  if (req.headers.token != '12345') {
    res.status(404).send(`Wrong http headers`)
  } else {
    next()
  }
}
