import { BASE_URL, handleResponse, getAuthHeaders } from './core';

export const conversations = {
  getAll: async () => {
    const response = await fetch(`${BASE_URL}/conversations`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  create: async (userId) => {
    const response = await fetch(`${BASE_URL}/conversations`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ userId })
    });
    return handleResponse(response);
  },
  
  markAsRead: async (conversationId) => {
    const response = await fetch(`${BASE_URL}/conversations/${conversationId}/read`, {
      method: 'PUT',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  }
};
