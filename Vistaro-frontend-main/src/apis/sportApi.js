import axios from "axios";

const API = "/api/v1/sport";

export const addSport = (data) => axios.post(`${API}`, data);

export const updateSport = (id, data) =>
  axios.put(`${API}/${id}`, data);

export const deleteSport = (id) =>
  axios.delete(`${API}/${id}`);

export const getSportById = (id) =>
  axios.get(`${API}/${id}`);

export const getSportsByEventId =(eventId)=>
  axios.get(`${API}/event/${eventId}`);

export const listAllSports = () =>
  axios.get(`${API}`);

export const getSportsByType = (type) =>
  axios.get(`${API}/type/${type}`);
