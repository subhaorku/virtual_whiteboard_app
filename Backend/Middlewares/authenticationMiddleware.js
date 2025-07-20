require('dotenv').config();
const jwt = require('jsonwebtoken');

const SECRET_KEY = process.env.JWT_SECRET;

const authenticationMiddleware = (req, res, next) => {
  try {
    // ✅ Always use lowercase for headers
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided' });
    }

    // Extract the token after "Bearer "
    const token = authHeader.split(' ')[1];

    // Verify the token
    const decoded = jwt.verify(token, SECRET_KEY);
    req.email = decoded.email; // Add email to request for downstream use

    next(); // proceed to controller
  } catch (error) {
    console.error('Auth error:', error);
    return res.status(401).json({ message: 'Authentication failed' });
  }
};

module.exports = authenticationMiddleware;
