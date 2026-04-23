import api from './api';

export const entityService = {
    /**
     * Search for entities (products, brands, etc.)
     * @param {string} query - Search term
     * @param {string} type - Optional type filter ('product', 'business', 'person')
     * @returns {Promise<Array>} List of matching entities
     */
    searchEntities: async (query, type = '') => {
        try {
            return await api.entities.search(query, type);
        } catch (error) {
            console.error('Error in searchEntities:', error);
            throw error;
        }
    },

    /**
     * Register a new entity frictionlessly
     * @param {Object} entityData - { name, type, description, phone, email }
     * @returns {Promise<Object>} The created/existing entity
     */
    registerEntity: async (entityData) => {
        try {
            return await api.entities.register(entityData);
        } catch (error) {
            console.error('Error in registerEntity:', error);
            throw error;
        }
    },

    /**
     * Get trust-based product suggestions
     * @returns {Promise<Array>} List of suggested entities
     */
    getSuggestions: async () => {
        try {
            return await api.entities.getSuggestions();
        } catch (error) {
            console.error('Error in getSuggestions:', error);
            throw error;
        }
    }
};

export default entityService;
