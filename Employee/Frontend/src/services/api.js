import axios from "axios";

const api = axios.create({
    baseURL: `${import.meta.env.VITE_API_URL}/api`,
    withCredentials: true, // sends HTTP-only cookie on every request
});

// Attach JWT from localStorage as Authorization header on every request
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("emp_token");
    if (token) {
        config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
});

// Redirect to login on 401
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem("emp_token");
            if (!window.location.pathname.includes("/login")) {
                window.location.replace("/login");
            }
        }
        return Promise.reject(error);
    }
);

export default api;
