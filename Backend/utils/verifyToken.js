const jwt = require('jsonwebtoken');
const SECRET_KEY = process.env.JWT_SECRET || "mysecretkey";

function verifyToken(token) {
  if (!token) throw new Error('No token provided');
  return jwt.verify(token, SECRET_KEY); // throws if invalid
}

module.exports = verifyToken;
