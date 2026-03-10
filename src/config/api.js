// API Configuration
const API_BASE = process.env.NEXT_PUBLIC_API_URL || process.env.REACT_APP_API_URL || 'http://localhost:4000';

export const API_CONFIG = {
  BASE_URL: API_BASE,
  API_BASE: `${API_BASE}/api`,
  SOCKET_URL: process.env.NEXT_PUBLIC_SOCKET_URL || process.env.REACT_APP_SOCKET_URL || API_BASE
};

export default API_CONFIG;

