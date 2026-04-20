// Maps user portal origin host:port to tenant name
// Admin portal ports (3001) are NOT mapped — admin is master
const TENANT_HOST_MAP = {
  'localhost:3002': 'Test',
  'localhost:4002': 'Demo',
};

module.exports = { TENANT_HOST_MAP };
