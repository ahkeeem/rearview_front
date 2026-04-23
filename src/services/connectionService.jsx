import api from '../services/api';

const connectionService = {
  getConnections: async () => {
    return api.connections.getAll();
  },

  sendConnectionRequest: async (connected_user_id) => {
    return api.connections.create(connected_user_id);
  },

  updateConnectionStatus: async (connectionId, status) => {
    return api.connections.updateStatus(connectionId, status);
  }
};

export default connectionService;