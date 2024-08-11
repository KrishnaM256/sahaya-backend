const jwt = require('jsonwebtoken')

const authorizeRole = (role) => {
  return (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1]
    if (!token) {
      return res.status(401).json({ message: 'No token provided' })
    }

    jwt.verify(token, process.env.JWT_PRIVATEKEY, (err, decoded) => {
      if (err) {
        return res.status(403).json({ message: 'Failed to authenticate token' })
      }

      if (decoded.role !== role) {
        return res.status(403).json({ message: 'Not authorized' })
      }

      req.user = decoded // Store user info in request
      next()
    })
  }
}

module.exports = authorizeRole
