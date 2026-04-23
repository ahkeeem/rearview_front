import { BASE_URL, handleResponse, getAuthHeaders } from './core';

export const users = {
  register: async (userData) => {
    const response = await fetch(`${BASE_URL}/users/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    return handleResponse(response);
  },

  login: async (credentials) => {
    const response = await fetch(`${BASE_URL}/users/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });
    return handleResponse(response);
  },

  forgotPassword: async (email) => {
    const response = await fetch(`${BASE_URL}/users/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    return handleResponse(response);
  },

  resetPassword: async (email, code, newPassword) => {
    const response = await fetch(`${BASE_URL}/users/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, code, newPassword })
    });
    return handleResponse(response);
  },

  confirmOTP: async (userId, code) => {
    const response = await fetch(`${BASE_URL}/users/login/confirm`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, code })
    });
    return handleResponse(response);
  },

  uploadImage: async (formData) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${BASE_URL}/users/upload-image`, {
      method: 'POST',
      headers: {
        'Authorization': token ? `Bearer ${token}` : ''
      },
      body: formData
    });
    return handleResponse(response);
  },

  getProfile: async (userId) => {
    const response = await fetch(`${BASE_URL}/users/profile/${userId}`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  updateProfile: async (userId, profileData) => {
    const response = await fetch(`${BASE_URL}/users/profile/${userId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(profileData)
    });
    return handleResponse(response);
  },

  deleteAccount: async (userId) => {
    const response = await fetch(`${BASE_URL}/users/profile/${userId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  toggle2FA: async (enabled) => {
    const response = await fetch(`${BASE_URL}/users/2fa`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ enabled })
    });
    return handleResponse(response);
  },

  getStats: async (userId) => {
    const response = await fetch(`${BASE_URL}/users/${userId}/stats`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  search: async (query) => {
    const response = await fetch(`${BASE_URL}/users/search?q=${query}`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  logout: async () => {
    const response = await fetch(`${BASE_URL}/users/logout`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  verifyNIN: async (nin) => {
    const response = await fetch(`${BASE_URL}/verifications/nin`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ nin })
    });
    return handleResponse(response);
  },

  verifyBVN: async (bvn) => {
    const response = await fetch(`${BASE_URL}/verifications/bvn`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ bvn })
    });
    return handleResponse(response);
  },

  verifyEmail: async () => {
    const response = await fetch(`${BASE_URL}/users/verify/send-email`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  confirmEmailOTP: async (code) => {
    const response = await fetch(`${BASE_URL}/users/verify/confirm-email`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ code })
    });
    return handleResponse(response);
  },

  verifyPhone: async (phone) => {
    const response = await fetch(`${BASE_URL}/users/verify/send-phone`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ phone })
    });
    return handleResponse(response);
  },

  confirmPhoneOTP: async (code) => {
    const response = await fetch(`${BASE_URL}/users/verify/confirm-phone`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ code })
    });
    return handleResponse(response);
  }
};
