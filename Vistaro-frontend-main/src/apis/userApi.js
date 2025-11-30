import axios from "axios";

const API = "/api/v1/user";

export const addUser = (data) => axios.post(`${API}`, data);

export const updateUser = (id, data) =>
  axios.put(`${API}/${id}`, data);

export const getUserById = (id) =>
  axios.get(`${API}/${id}`);
