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
  },

  /**
   * Suggested users to connect with (e.g. search-based until backend has dedicated endpoint).
   * Returns users excluding current user; filter by existing connections on the caller if needed.
   */
  getSuggestedConnections: async () => {
    try {
      const list = await api.users.search(' ');
      return Array.isArray(list) ? list.slice(0, 10) : [];
    } catch {
      return [];
    }
  },

  /**
   * Profile completeness: score 0–100 and list of tasks. Derived from profile + stats.
   */
  getProfileStrength: async (userId) => {
    try {
      const [profile, stats] = await Promise.all([
        api.users.getProfile(userId).catch(() => null),
        api.users.getStats(userId).catch(() => null)
      ]);
      const tasks = [];
      if (!profile?.bio?.trim()) tasks.push('Add a bio');
      if (!profile?.phone?.trim()) tasks.push('Add phone number');
      if (!stats?.verificationCount) tasks.push('Get verified');
      if (!stats?.reviewCount || stats.reviewCount < 1) tasks.push('Receive at least one review');
      const completed = 4 - tasks.length;
      const score = Math.round((completed / 4) * 100);
      return { score: Math.max(0, score), tasks };
    } catch {
      return { score: 0, tasks: ['Complete your profile'] };
    }
  }
};