import axios from 'axios';

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
});

// Interceptor to add Tenant Hub Header if available
api.interceptors.request.use((config) => {
    if (typeof window !== 'undefined') {
        // In browser, we might get subdomain context
        const hostname = window.location.hostname;
        const parts = hostname.split('.');
        if (parts.length > 2) {
            config.headers['x-tenant-subdomain'] = parts[0];
        }
    }
    return config;
});

export default api;
