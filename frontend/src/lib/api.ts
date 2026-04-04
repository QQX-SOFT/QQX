import axios, { InternalAxiosRequestConfig } from "axios";

const baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

const api = axios.create({
    baseURL: baseURL.endsWith("/") ? baseURL.slice(0, -1) : baseURL,
    withCredentials: true,
});

if (typeof window !== "undefined" && !process.env.NEXT_PUBLIC_API_URL && window.location.hostname !== "localhost") {
    console.warn("⚠️ NEXT_PUBLIC_API_URL is not set. Frontend is trying to connect to localhost:3001, which will fail for external users.");
}

// Request interceptor to attach tenant subdomain and user metadata
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    if (typeof window !== "undefined") {
        const hostname = window.location.hostname;
        const mainDomains = ['localhost', 'qqx-eight.vercel.app', 'qqx.de', 'qqxsoft.com', 'www.qqxsoft.com'];

        // Simple logic: if subdomain exists (e.g. tenant1.localhost or tenant1.qqx-app.de)
        const parts = hostname.split(".");

        if (parts.length > 2) {
            const potentialSubdomain = parts[0];
            if (potentialSubdomain !== 'www' && !mainDomains.includes(hostname)) {
                config.headers["x-tenant-subdomain"] = potentialSubdomain;
            }
        } else if (parts.length === 2 && parts[1] === "localhost") {
            config.headers["x-tenant-subdomain"] = parts[0];
        }

        // Attach user ID for authenticated requests
        try {
            const userStr = localStorage.getItem("user");
            if (userStr) {
                const user = JSON.parse(userStr);
                if (user?.id) {
                    config.headers["x-user-id"] = user.id;
                }
            }
        } catch (_) {}
    }
    return config;
});

export default api;
