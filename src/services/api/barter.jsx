import { BASE_URL, handleResponse, getAuthHeaders } from './core';

export const barter = {
  addItem: async (itemData, imageFile) => {
    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('item_name', itemData.item_name);
    formData.append('want_category', itemData.want_category);
    formData.append('category', itemData.category || 'other');
    if (itemData.description) formData.append('description', itemData.description);
    if (imageFile) formData.append('image', imageFile);

    const response = await fetch(`${BASE_URL}/barter/items`, {
      method: 'POST',
      headers: { 'Authorization': token ? `Bearer ${token}` : '' },
      body: formData // No Content-Type header — browser sets multipart boundary automatically
    });
    return handleResponse(response);
  },
  
  browseItems: async (category = 'all', page = 1) => {
    const query = category && category !== 'all' ? `?category=${category}&page=${page}` : `?page=${page}`;
    const response = await fetch(`${BASE_URL}/barter/browse${query}`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },
  
  getMyLoops: async () => {
    const response = await fetch(`${BASE_URL}/barter/loops`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },
  
  signLoop: async (loopId) => {
    const response = await fetch(`${BASE_URL}/barter/loops/${loopId}/sign`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },
  
  disputeLoop: async (loopId, ghostingUserId) => {
    const response = await fetch(`${BASE_URL}/barter/loops/${loopId}/dispute`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ ghosting_user_id: ghostingUserId })
    });
    return handleResponse(response);
  }
};
