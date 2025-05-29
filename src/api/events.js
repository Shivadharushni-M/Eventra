// src/api/events.js
import { fetchWithAuth } from './config';

export const getEvents = async () => {
  return fetchWithAuth('/api/events');
};

export const registerForEvent = async (eventId, data) => {
  return fetchWithAuth(`/api/events/${eventId}/register`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
};