/**
 * Application-wide constants for roles, categories, and pagination defaults.
 */

const ROLES = {
  VIEWER: 'viewer',
  ANALYST: 'analyst',
  ADMIN: 'admin',
};

const ROLE_HIERARCHY = {
  [ROLES.VIEWER]: 1,
  [ROLES.ANALYST]: 2,
  [ROLES.ADMIN]: 3,
};

const USER_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
};

const RECORD_TYPES = {
  INCOME: 'income',
  EXPENSE: 'expense',
};

const RECORD_CATEGORIES = [
  'salary',
  'freelance',
  'investments',
  'rent',
  'utilities',
  'food',
  'transportation',
  'healthcare',
  'entertainment',
  'education',
  'shopping',
  'travel',
  'insurance',
  'taxes',
  'gifts',
  'subscriptions',
  'other',
];

const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
};

module.exports = {
  ROLES,
  ROLE_HIERARCHY,
  USER_STATUS,
  RECORD_TYPES,
  RECORD_CATEGORIES,
  PAGINATION,
};
