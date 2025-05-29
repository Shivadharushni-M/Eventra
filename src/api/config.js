// src/api/config.js
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL; // From .env

// Helper for authenticated requests
export const fetchWithAuth = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token'); // Or use a state manager

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: token ? `Bearer ${token}` : '',
      ...options.headers,
    },
  });

  if (!response.ok) throw new Error(await response.text());
  return response.json();
};