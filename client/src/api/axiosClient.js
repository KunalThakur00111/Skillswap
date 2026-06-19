import axios from "axios";

// Determine the base URL based on environment
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const axiosClient = axios.create({
    baseURL: API_URL,
    headers: {
        "Content-Type": "application/json"
    }
});

// Request Interceptor: Attach the token
axiosClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response Interceptor: Global Error Handling
axiosClient.interceptors.response.use(
    (response) => {
        // Axios wraps the response in a 'data' object.
        // Our backend also returns a 'data' object for pagination: { success: true, data: [...], meta: {...} }
        return response.data;
    },
    (error) => {
        // Handle 401 Unauthorized globally
        if (error.response && error.response.status === 401) {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            // Optional: Dispatch a custom event to force the app to log out immediately
            window.dispatchEvent(new Event("auth-expired"));
        }

        // Format error nicely
        const customError = new Error(
            error.response?.data?.message || "An unexpected error occurred"
        );
        customError.status = error.response?.status;
        customError.details = error.response?.data?.errors; // For Zod validation errors

        return Promise.reject(customError);
    }
);

export default axiosClient;
