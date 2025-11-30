import axios from "axios";

const API_BASE = "http://localhost:9090/api/v1/eventslot";

export const getAllSlots = () =>
  axios.get(API_BASE);

export const getSlotById = (slotId) =>
  axios.get(`${API_BASE}/${slotId}`);

export const getSlotsByEventId = (eventId) =>
  axios.get(`${API_BASE}/event/${eventId}`);

export const getSlotsByCity = (city) =>
  axios.get(`${API_BASE}/search/city?city=${city}`);

export const addSlot = (slot) =>
  axios.post(API_BASE, slot);

export const updateSlot = (slotId, slot) =>
  axios.put(`${API_BASE}/${slotId}`, slot);

export const deleteSlot = (slotId) =>
  axios.delete(`${API_BASE}/${slotId}`);
