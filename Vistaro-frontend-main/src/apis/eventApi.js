// src/api/eventapi.js
import axios from "axios";

const API_BASE = "http://localhost:9090/api/v1/event";

export const getAllEvents = (city) =>
  axios.get(API_BASE, { params: { city } });

export const getEventById = (id) =>
  axios.get(`${API_BASE}/${id}`);

// Search by Category
export const searchByCategory = (city, category) =>
  axios.get(`${API_BASE}/search/category`, {
    params: { city, category }
  });

// Search by SubCategory
export const searchBySubCategory = (city, sub) =>
  axios.get(`${API_BASE}/search/sub-category`, {
    params: { city, subCategory: sub }
  });

// Search by Title
export const searchByTitle = (city, title) =>
  axios.get(`${API_BASE}/search/title`, {
    params: { city, title }
  });

// Add event
export const addEvent = (event) =>
  axios.post(API_BASE, event);

// Update event
export const updateEvent = (id, event) =>
  axios.put(`${API_BASE}/${id}`, event);
