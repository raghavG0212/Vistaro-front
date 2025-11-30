
import axios from "axios";

const API = "/api/v1/booking";

export const createBooking = (data) => axios.post(`${API}/add`, data);

export const getBookingById = (id) => axios.get(`${API}/id/${id}`);

export const getAllBookings = () => axios.get(`${API}/all`);

export const updateBooking = (id, data) =>
  axios.put(`${API}/${id}`, data);

export const deleteBooking = (id) =>
  axios.delete(`${API}/${id}`);

export const getBookingsByUser = (userId) =>
  axios.get(`${API}/user/${userId}`);

export const getBookingsBySlot = (slotId) =>
  axios.get(`${API}/slot/${slotId}`);
