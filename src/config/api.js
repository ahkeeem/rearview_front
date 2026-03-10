const isBrowser = typeof window !== 'undefined';
const isProdHosted = isBrowser && window.location.hostname.endsWith('vercel.app');

// Replace with your actual Render backend URL:
const RENDER_API_BASE = 'https://<your-render-backend>.onrender.com';

const DEFAULT_API_BASE = isProdHosted ? RENDER_API_BASE : 'http://localhost:4000';

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.REACT_APP_API_URL ||
  DEFAULT_API_BASE;

export const API_CONFIG = {
  BASE_URL: API_BASE,
  API_BASE: `${API_BASE}/api`,
  SOCKET_URL:
    process.env.NEXT_PUBLIC_SOCKET_URL ||
    process.env.REACT_APP_SOCKET_URL ||
    API_BASE,
};

export default API_CONFIG;