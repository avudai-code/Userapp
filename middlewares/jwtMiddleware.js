const jwt = require('jsonwebtoken');
const jwtSecret = 'secret'; 

module.exports = function (req, res, next) {
  // Get the token from the request headers or other sources as needed.
  const token = req.headers.authorization;

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    // Verify and decode the token using your secret key.
    const decoded = jwt.verify(token, jwtSecret);
    req.user = decoded.user; 
    next(); // Continue to the next middleware or route.
  } catch (error) {
    return res.status(401).json({ message: 'Token is not valid' });
  }
};