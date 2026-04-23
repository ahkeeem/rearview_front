import { BASE_URL, handleResponse, getAuthHeaders } from './core';

export const admin = {
  getDisputes: async (status = 'disputed') => {
    const response = await fetch(`${BASE_URL}/admin/disputes?status=${status}`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },
  
  resolveDispute: async (orderId, resolution) => {
    const response = await fetch(`${BASE_URL}/admin/disputes/${orderId}/resolve`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ resolution })
    });
    return handleResponse(response);
  },
  
  getDisputeMessages: async (orderId) => {
    const response = await fetch(`${BASE_URL}/admin/disputes/${orderId}/messages`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },
  
  addDisputeMessage: async (orderId, data) => {
    const response = await fetch(`${BASE_URL}/admin/disputes/${orderId}/messages`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(response);
  },
  
  getAllEscrowOrders: async (status = '') => {
    const url = status
      ? `${BASE_URL}/admin/escrow/all?status=${status}`
      : `${BASE_URL}/admin/escrow/all`;
    const response = await fetch(url, { headers: getAuthHeaders() });
    return handleResponse(response);
  },
  
  getPendingVerifications: async () => {
    const response = await fetch(`${BASE_URL}/admin/verifications/pending`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },
  
  reviewVerification: async (id, status) => {
    const response = await fetch(`${BASE_URL}/admin/verifications/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status })
    });
    return handleResponse(response);
  }
};
