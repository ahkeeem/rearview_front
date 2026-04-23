import { BASE_URL, handleResponse, getAuthHeaders } from './core';

export const payments = {
  getWallet: async () => {
    const response = await fetch(`${BASE_URL}/payments/wallet`, { headers: getAuthHeaders() });
    return handleResponse(response);
  },
  
  getTransactions: async (page = 1, limit = 20) => {
    const response = await fetch(`${BASE_URL}/payments/transactions?page=${page}&limit=${limit}`, { headers: getAuthHeaders() });
    return handleResponse(response);
  },
  
  initializePayment: async (data) => {
    const response = await fetch(`${BASE_URL}/payments/initialize`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(response);
  },
  
  initiateTopUp: async (amount) => {
    const response = await fetch(`${BASE_URL}/payments/topup`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ amount })
    });
    return handleResponse(response);
  },
  
  verifyPayment: async (reference) => {
    const response = await fetch(`${BASE_URL}/payments/verify/${reference}`, { headers: getAuthHeaders() });
    return handleResponse(response);
  },
  
  getBanks: async () => {
    const response = await fetch(`${BASE_URL}/payments/banks`, { headers: getAuthHeaders() });
    return handleResponse(response);
  },
  
  verifyAccount: async (data) => {
    const response = await fetch(`${BASE_URL}/payments/verify-account`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(response);
  },
  
  requestPayout: async (data) => {
    const response = await fetch(`${BASE_URL}/payments/payout`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(response);
  }
};
