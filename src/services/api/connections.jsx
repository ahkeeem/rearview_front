import { BASE_URL, handleResponse, getAuthHeaders } from './core';

export const connections = {
  getAll: async () => {
    const response = await fetch(`${BASE_URL}/connections`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  create: async (connected_user_id) => {
    const response = await fetch(`${BASE_URL}/connections`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ connected_user_id })
    });
    return handleResponse(response);
  },

  updateStatus: async (connectionId, status) => {
    const response = await fetch(`${BASE_URL}/connections/${connectionId}/status`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status })
    });
    return handleResponse(response);
  },
  
  delete: async (connectionId) => {
    const response = await fetch(`${BASE_URL}/connections/${connectionId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  }
};
