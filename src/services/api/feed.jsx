import { BASE_URL, handleResponse, getAuthHeaders } from './core';

export const feed = {
  get: async (scope = 'mixed', sinceId = null) => {
    const url = sinceId 
      ? `${BASE_URL}/feed?scope=${scope}&sinceId=${sinceId}` 
      : `${BASE_URL}/feed?scope=${scope}`;
    const response = await fetch(url, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },
  
  getWarnings: async () => {
    const response = await fetch(`${BASE_URL}/feed/warnings`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },
  
  getNotifications: async () => {
    const response = await fetch(`${BASE_URL}/feed/notifications`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  }
};
