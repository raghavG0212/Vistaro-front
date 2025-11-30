import axios from "axios";

const API = "/api/v1/seat";

export const getSeatsForSlot = (slotId) =>
  axios.get(`${API}/slot/${slotId}`);

export const lockSeats = (seatIds) =>
  axios.post(`${API}/lock`, { seatIds });

export const unlockSeats = (seatIds) =>
  axios.post(`${API}/unlock`, { seatIds });
