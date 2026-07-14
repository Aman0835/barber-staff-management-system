import axios from "axios";

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api`,
  withCredentials: true,
});

// Redirect to login on 401 (token missing or expired)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Avoid redirect loop if already on /login
      if (!window.location.pathname.includes("/login")) {
        window.location.replace("/login");
      }
    }
    return Promise.reject(error);
  }
);

export default api;