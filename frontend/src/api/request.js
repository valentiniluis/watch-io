import axios from "axios";

const api = axios.create({ 
  baseURL: import.meta.env.VITE_BACKEND_BASE,
  withCredentials: true
});

export default api;