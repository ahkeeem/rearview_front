import api from './api';
import API_CONFIG from '../config/api';

const BASE_URL = API_CONFIG.API_BASE;

export const userService = {
  // Existing profile functions
  getProfile: async (userId) => {
    return api.users.getProfile(userId);
  },
  
  updateProfile: async (userId, data) => {
    return api.users.updateProfile(userId, data);
  },
  
  searchUsers: async (searchTerm) => {
    return api.users.search(searchTerm);
  },

  // Review functions
  getReceivedReviews: async () => {
    return api.reviews.getReceived();
  },

  getGivenReviews: async () => {
    return api.reviews.getGiven();
  },

  submitReview: async (reviewData) => {
    return api.reviews.submit(reviewData);
  },

  getUserReviews: async (userId) => {
    return api.reviews.getUserReviews(userId);
  },

  // Stats
  getUserStats: async (userId) => {
    return api.users.getStats(userId);
  }
};