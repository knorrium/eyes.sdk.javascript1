module.exports = (req, res, next) => {
  if (req.header('connection') === 'close') {
    res.status(403).json({
      message: 'Forbidden'
    })
    return
  }
  next()
}
