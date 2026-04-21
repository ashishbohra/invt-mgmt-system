const ROLES = Object.freeze({
  ADMIN: 'Admin',
  MANAGER: 'Manager',
  USER: 'User',
});

const PORTALS = Object.freeze({
  ADMIN: 'AdminPortal',
  USER: 'UserPortal',
});

const ALL_ROLES = Object.values(ROLES);
const ALL_PORTALS = Object.values(PORTALS);

const CATEGORIES = Object.freeze({
  ELECTRONICS: 'Electronics',
  CLOTHING: 'Clothing',
  FOOD_BEVERAGE: 'Food & Beverage',
  FURNITURE: 'Furniture',
  HEALTH_BEAUTY: 'Health & Beauty',
  SPORTS: 'Sports & Outdoors',
  AUTOMOTIVE: 'Automotive',
  OFFICE_SUPPLIES: 'Office Supplies',
  TOYS_GAMES: 'Toys & Games',
  OTHER: 'Other',
});

const ALL_CATEGORIES = Object.values(CATEGORIES);

const PASSWORD_POLICY = {
  minLength: 8,
  regex: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/,
  message: 'Password must be at least 8 characters with 1 uppercase, 1 lowercase, 1 number, and 1 special character (@$!%*?&#)',
};

module.exports = { ROLES, PORTALS, ALL_ROLES, ALL_PORTALS, CATEGORIES, ALL_CATEGORIES, PASSWORD_POLICY };
