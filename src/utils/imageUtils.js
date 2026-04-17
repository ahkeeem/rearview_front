import API_CONFIG from '../config/api';

/**
 * Resolves a database-stored image path to a full URL.
 * Handles both external URLs (https://...) and internal relative paths (/uploads/...).
 */
export const getImageUrl = (path) => {
  if (!path) return null;
  
  // If it's already a full URL (external or blob), return as is
  if (path.startsWith('http') || path.startsWith('blob:') || path.startsWith('data:')) {
    return path;
  }
  
  // Clean the path to ensure it starts with /uploads
  let cleanPath = path;
  if (!path.startsWith('/')) {
    cleanPath = '/' + path;
  }
  
  // Ensure we don't double up on /api if the base includes it
  const baseUrl = API_CONFIG.API_BASE.replace('/api', '');
  
  return `${baseUrl}${cleanPath}`;
};
