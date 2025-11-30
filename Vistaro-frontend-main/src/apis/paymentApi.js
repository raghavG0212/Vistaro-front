import axios from "axios";

const API = "/api/v1/payment";

export const createPayment = (data) =>
  axios.post(`${API}`, data);

export const getPaymentById = (id) =>
  axios.get(`${API}/${id}`);
