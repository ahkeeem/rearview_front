import { BASE_URL, handleResponse, getAuthHeaders } from './core';

export const messages = {
  getByConversation: async (conversationId) => {
    const response = await fetch(`${BASE_URL}/messages/conversation/${conversationId}`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  send: async (conversationId, content) => {
    const response = await fetch(`${BASE_URL}/messages`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ conversationId, content })
    });
    return handleResponse(response);
  }
};
