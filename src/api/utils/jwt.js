const jwt = require('jsonwebtoken');

const SECRET = process.env.JWT_SECRET || 'invt-mgmt-secret-key';
const EXPIRY = '20m';

function signToken(payload) {
  return jwt.sign(payload, SECRET, { expiresIn: EXPIRY });
}

function verifyToken(token) {
  return jwt.verify(token, SECRET);
}

function decodeToken(token) {
  return jwt.decode(token);
}

module.exports = { signToken, verifyToken, decodeToken };
