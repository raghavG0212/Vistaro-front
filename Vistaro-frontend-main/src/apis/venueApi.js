import axios from "axios";

const API = "/api/v1/venue";

export const createVenue = (data) =>
  axios.post(`${API}`, data);

export const updateVenue = (id, data) =>
  axios.put(`${API}/${id}`, data);

export const getVenueById = (id) =>
  axios.get(`${API}/${id}`);

export const getAllVenues = () =>
  axios.get(`${API}/all`);

export const searchVenueByName = (name) =>
  axios.get(`${API}/search/name`, { params: { name } });

export const searchVenueByCity = (city) =>
  axios.get(`${API}/search/city`, { params: { city } });

export const searchVenueByType = (type) =>
  axios.get(`${API}/search/type`, { params: { type } });

export const searchVenueByScreen = (screen) =>
  axios.get(`${API}/search/screen`, { params: { screen } });
