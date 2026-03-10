// API base URL configuration for CRA/Vercel
// In production (Vercel), set REACT_APP_API_URL to your Render backend base URL, e.g.:
// REACT_APP_API_URL=https://rearview-api.onrender.com

const API_BASE =
  process.env.REACT_APP_API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  'http://localhost:4000';

export const API_CONFIG = {
  BASE_URL: API_BASE,
  API_BASE: `${API_BASE}/api`,
  SOCKET_URL:
    process.env.REACT_APP_SOCKET_URL ||
    process.env.NEXT_PUBLIC_SOCKET_URL ||
    API_BASE,
};

export default API_CONFIG;