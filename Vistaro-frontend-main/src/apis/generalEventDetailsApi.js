import axios from "axios";

const API_BASE = "http://localhost:9090/api/v1/event-details";

export const getAllEventDetails = () =>
  axios.get(API_BASE);

export const getEventDetailsById = (id) =>
  axios.get(`${API_BASE}/${id}`);

export const getGeneralEventByEventId = (eventId) =>
  axios.get(`${API_BASE}/event/${eventId}`);

export const addEventDetails = (details) =>
  axios.post(`${API_BASE}/add`, details);

export const updateEventDetails = (id, details) =>
  axios.put(`${API_BASE}/${id}`, details);

export const deleteEventDetails = (id) =>
  axios.delete(`${API_BASE}/${id}`);
