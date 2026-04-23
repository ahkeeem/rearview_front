import { BASE_URL, handleResponse, getAuthHeaders } from './core';

export const escrow = {
  createOrder: async (data) => {
    const response = await fetch(`${BASE_URL}/escrow/orders`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(response);
  },
  
  getOrders: async (role, status) => {
    let query = '?';
    if (role) query += `role=${role}&`;
    if (status) query += `status=${status}`;
    const response = await fetch(`${BASE_URL}/escrow/orders${query}`, { headers: getAuthHeaders() });
    return handleResponse(response);
  },
  
  getOrderDetail: async (id) => {
    const response = await fetch(`${BASE_URL}/escrow/orders/${id}`, { headers: getAuthHeaders() });
    return handleResponse(response);
  },
  
  confirmDelivery: async (id) => {
    const response = await fetch(`${BASE_URL}/escrow/orders/${id}/confirm`, {
      method: 'PUT',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  markDelivered: async (id) => {
    const response = await fetch(`${BASE_URL}/escrow/orders/${id}/deliver`, {
      method: 'PUT',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },
  
  disputeOrder: async (id, reason) => {
    const response = await fetch(`${BASE_URL}/escrow/orders/${id}/dispute`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ reason })
    });
    return handleResponse(response);
  },

  getDisputeMessages: async (id) => {
    const response = await fetch(`${BASE_URL}/escrow/orders/${id}/messages`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  addDisputeMessage: async (id, data) => {
    const response = await fetch(`${BASE_URL}/escrow/orders/${id}/messages`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(response);
  },
  
  resolveDispute: async (id, resolution) => {
    const response = await fetch(`${BASE_URL}/escrow/orders/${id}/resolve`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ resolution })
    });
    return handleResponse(response);
  }
};
