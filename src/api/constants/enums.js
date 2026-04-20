const ROLES = Object.freeze({
  ADMIN: 'Admin',
  USER: 'User',
});

const PORTALS = Object.freeze({
  ADMIN: 'AdminPortal',
  USER: 'UserPortal',
});

const ALL_ROLES = Object.values(ROLES);
const ALL_PORTALS = Object.values(PORTALS);

const PASSWORD_POLICY = {
  minLength: 8,
  regex: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/,
  message: 'Password must be at least 8 characters with 1 uppercase, 1 lowercase, 1 number, and 1 special character (@$!%*?&#)',
};

module.exports = { ROLES, PORTALS, ALL_ROLES, ALL_PORTALS, PASSWORD_POLICY };
