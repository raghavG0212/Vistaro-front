import axios from "axios";

const API = "/api/v1/movie";

export const addMovie = (data) => axios.post(`${API}`, data);

export const updateMovie = (id, data) =>
  axios.put(`${API}/${id}`, data);

export const deleteMovie = (id) =>
  axios.delete(`${API}/${id}`);

export const getMovieByEventId = (eventId) =>
  axios.get(`${API}/event/${eventId}`);

export const getMovieById = (id) =>
  axios.get(`${API}/${id}`);

export const listAllMovies = () =>
  axios.get(`${API}`);

export const getMoviesByGenre = (genre) =>
  axios.get(`${API}/genre/${genre}`);
