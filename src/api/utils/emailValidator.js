const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateEmail(email) {
  if (!email || !EMAIL_REGEX.test(email)) {
    throw { status: 400, message: 'Invalid email format' };
  }
}

module.exports = { validateEmail };
