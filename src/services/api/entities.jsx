import { BASE_URL, handleResponse, getAuthHeaders } from './core';

export const entities = {
  search: async (query, type = '') => {
    const url = type ? `${BASE_URL}/entities/search?q=${query}&type=${type}` : `${BASE_URL}/entities/search?q=${query}`;
    const response = await fetch(url, { headers: getAuthHeaders() });
    return handleResponse(response);
  },
  
  register: async (entityData) => {
    const response = await fetch(`${BASE_URL}/entities/register`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(entityData)
    });
    return handleResponse(response);
  },
  
  getSuggestions: async () => {
    const response = await fetch(`${BASE_URL}/entities/suggestions`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  }
};
