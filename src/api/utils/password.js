const bcrypt = require('bcryptjs');
const { PASSWORD_POLICY } = require('../constants/enums');

function validatePassword(password) {
  if (!password || !PASSWORD_POLICY.regex.test(password)) {
    throw { status: 400, message: PASSWORD_POLICY.message };
  }
}

async function hashPassword(password) {
  return bcrypt.hash(password, 10);
}

async function comparePassword(plain, hashed) {
  return bcrypt.compare(plain, hashed);
}

module.exports = { validatePassword, hashPassword, comparePassword };
