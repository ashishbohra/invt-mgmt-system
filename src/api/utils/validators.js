const { ALL_ROLES, ALL_PORTALS } = require('../constants/enums');

function validateRoles(roles) {
  if (!Array.isArray(roles) || roles.length === 0) {
    throw { status: 400, message: 'Roles must be a non-empty array' };
  }
  const invalid = roles.filter((r) => !ALL_ROLES.includes(r));
  if (invalid.length) {
    throw { status: 400, message: `Invalid roles: ${invalid.join(', ')}. Allowed: ${ALL_ROLES.join(', ')}` };
  }
}

function validatePortals(portals) {
  if (!Array.isArray(portals) || portals.length === 0) {
    throw { status: 400, message: 'Portals must be a non-empty array' };
  }
  const invalid = portals.filter((p) => !ALL_PORTALS.includes(p));
  if (invalid.length) {
    throw { status: 400, message: `Invalid portals: ${invalid.join(', ')}. Allowed: ${ALL_PORTALS.join(', ')}` };
  }
}

module.exports = { validateRoles, validatePortals };
