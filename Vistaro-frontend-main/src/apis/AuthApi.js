
import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:9090", // BACKEND PORT
});

// Attach token on every request if present
API.interceptors.request.use((req) => {
  let token = localStorage.getItem("token");

  // fallback: if you stored full auth object as `vistaroAuth`
  if (!token) {
    const raw = localStorage.getItem("vistaroAuth");
    if (raw) {
      try {
        const auth = JSON.parse(raw);
        token = auth?.token || null;
      } catch (e) {
        console.error("Failed to parse vistaroAuth from localStorage", e);
      }
    }
  }

  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }

  return req;
});

// ---------- AUTH APIS ----------
export const signupUser = (data) => API.post("/api/v1/auth/signup", data);
export const loginUser = (data) => API.post("/api/v1/auth/login", data);

// ---------- USER APIS ----------
export const getUserById = (id) => API.get(`/api/v1/user/${id}`);

export default API;
