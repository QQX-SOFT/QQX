import axios, { InternalAxiosRequestConfig } from "axios";

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api",
});

// Add a request interceptor to attach the tenant subdomain from the current window location
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    if (typeof window !== "undefined") {
        const hostname = window.location.hostname;
        // Simple logic: if subdomain exists (e.g. tenant1.localhost or tenant1.qqx-app.de)
        const parts = hostname.split(".");
        if (parts.length > 2 || (parts.length === 2 && parts[1] === "localhost")) {
            config.headers["x-tenant-subdomain"] = parts[0];
        }
    }
    return config;
});

export default api;
