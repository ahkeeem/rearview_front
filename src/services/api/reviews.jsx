import { BASE_URL, handleResponse, getAuthHeaders } from './core';

export const reviews = {
  getReceived: async () => {
    const response = await fetch(`${BASE_URL}/reviews/received`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  getGiven: async () => {
    const response = await fetch(`${BASE_URL}/reviews/given`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  submit: async (reviewData) => {
    const response = await fetch(`${BASE_URL}/reviews`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(reviewData)
    });
    return handleResponse(response);
  },

  getStats: async () => {
    const response = await fetch(`${BASE_URL}/reviews/stats`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  getUserReviews: async (userId) => {
    const response = await fetch(`${BASE_URL}/reviews/user/${userId}`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  dispute: async (reviewId, reason) => {
    const response = await fetch(`${BASE_URL}/reviews/${reviewId}/dispute`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ reason })
    });
    return handleResponse(response);
  },

  resolve: async (reviewId, proof_url) => {
    const response = await fetch(`${BASE_URL}/reviews/${reviewId}/resolve`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ proof_url })
    });
    return handleResponse(response);
  },

  reply: async (reviewId, content) => {
    const response = await fetch(`${BASE_URL}/reviews/${reviewId}/responses`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ content })
    });
    return handleResponse(response);
  }
};
