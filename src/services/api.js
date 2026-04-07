import API_CONFIG from '../config/api';

const BASE_URL = API_CONFIG.API_BASE;

const handleResponse = async (response) => {
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    // Prefer backend error / validation messages when available
    const validationMessage = Array.isArray(data.details) && data.details.length
      ? data.details[0].msg
      : undefined;

    const message =
      data.error ||
      data.message ||
      validationMessage ||
      'Request failed';

    throw new Error(message);
  }

  return data;
};

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : ''
  };
};

const api = {
  users: {
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

    uploadImage: async (formData) => {
      const token = localStorage.getItem('token');
      const response = await fetch(`${BASE_URL}/users/upload-image`, {
        method: 'POST',
        headers: {
          'Authorization': token ? `Bearer ${token}` : ''
          // Note: Content-Type is NOT set here to allow the browser to auto-set the multipart boundary
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
    }
  },

  connections: {
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
    }
  },
  reviews: {
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
  },

  conversations: {
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
    }
  },

  messages: {
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
  },

  feed: {
    get: async (scope = 'mixed') => {
      const response = await fetch(`${BASE_URL}/feed?scope=${scope}`, {
        headers: getAuthHeaders()
      });
      return handleResponse(response);
    },
    getWarnings: async () => {
      const response = await fetch(`${BASE_URL}/feed/warnings`, {
        headers: getAuthHeaders()
      });
      return handleResponse(response);
    }
  },

  entities: {
    search: async (query, type = '') => {
      const url = type ? `${BASE_URL}/entities/search?q=${query}&type=${type}` : `${BASE_URL}/entities/search?q=${query}`;
      const response = await fetch(url, { headers: getAuthHeaders() });
      return handleResponse(response);
    },
    register: async (entityData) => {
      const response = await fetch(`${BASE_URL}/entities/register`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(entityData)
      });
      return handleResponse(response);
    }
  },

  threads: {
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
  }
};
export default api;