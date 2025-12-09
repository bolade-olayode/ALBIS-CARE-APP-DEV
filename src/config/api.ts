// src/config/api.ts

export const API_CONFIG = {
  BASE_URL: 'https://albiscare.co.uk/api',
  ENDPOINTS: {
    LOGIN: '/v1/auth/login.php',
    LOGOUT: '/v1/auth/logout.php',
    STAFF: '/v1/staff',
    CLIENTS: '/v1/clients/',
    VISITS: '/v1/visits',
    LOGS: '/v1/logs',
  },
  TIMEOUT: 10000, // 10 seconds
};

export default API_CONFIG;