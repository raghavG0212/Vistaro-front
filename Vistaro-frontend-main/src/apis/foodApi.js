import axios from "axios";

const API_BASE = "http://localhost:9090/api/v1/food";

export const getAllFoods = () => axios.get(API_BASE);
export const getFoodById = (id) => axios.get(`${API_BASE}/${id}`);
export const getFoodsBySlot = (slotId) => axios.get(`${API_BASE}/slot/${slotId}`);
export const addFood = (food) => axios.post(`${API_BASE}/add`, food);
export const updateFood = (id, food) => axios.put(`${API_BASE}/${id}`, food);
export const deleteFood = (id) => axios.delete(`${API_BASE}/${id}`);
