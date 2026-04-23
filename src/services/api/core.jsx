import API_CONFIG from '../../config/api';

export const BASE_URL = API_CONFIG.API_BASE;

export const handleResponse = async (response) => {
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const validationMessage = Array.isArray(data.details) && data.details.length
      ? data.details[0].msg
      : undefined;

    let message =
      data.error ||
      data.message ||
      validationMessage ||
      'Request failed';

    if (data.details) {
      if (Array.isArray(data.details)) {
        const msgs = data.details.map(d => d.msg || JSON.stringify(d)).join('; ');
        message += ` — ${msgs}`;
      } else if (typeof data.details === 'string') {
        message += ` (${data.details})`;
      }
    }

    throw new Error(message);
  }

  return data;
};

export const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : ''
  };
};
