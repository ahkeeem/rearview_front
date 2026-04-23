import { BASE_URL, handleResponse, getAuthHeaders } from './core';

export const threads = {
  getByEntity: async (entityId) => {
    const response = await fetch(`${BASE_URL}/threads/entity/${entityId}`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },
  
  create: async (threadData) => {
    const response = await fetch(`${BASE_URL}/threads`, {
      method: 'POST',
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(threadData)
    });
    return handleResponse(response);
  },
  
  getComments: async (threadId) => {
    const response = await fetch(`${BASE_URL}/threads/${threadId}`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },
  
  addComment: async (threadId, content) => {
    const response = await fetch(`${BASE_URL}/threads/${threadId}/comments`, {
      method: 'POST',
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ content })
    });
    return handleResponse(response);
  }
};
