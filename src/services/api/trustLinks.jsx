import { BASE_URL, handleResponse, getAuthHeaders } from './core';

export const trustLinks = {
  getMyLinks: async () => {
    const response = await fetch(`${BASE_URL}/trust-links`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },
  
  createLink: async (data) => {
    const response = await fetch(`${BASE_URL}/trust-links`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(response);
  },
  
  toggleLinkStatus: async (id, isActive) => {
    const response = await fetch(`${BASE_URL}/trust-links/${id}/toggle`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ is_active: isActive })
    });
    return handleResponse(response);
  },
  
  getPublicLink: async (slug) => {
    const response = await fetch(`${BASE_URL}/trust-links/public/${slug}`, {
      headers: { 'Content-Type': 'application/json' } // Intentionally public, no auth header needed
    });
    return handleResponse(response);
  }
};
