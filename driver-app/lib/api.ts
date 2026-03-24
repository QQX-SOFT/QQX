import axios from 'axios';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// In production, point this to your Vercel backend URL (e.g. https://qqx-api.vercel.app/api)
const API_URL = Platform.OS === 'android' ? 'http://10.0.2.2:3001' : 'http://localhost:3001';

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(async (config) => {
  try {
    const subdomain = await AsyncStorage.getItem('tenant_subdomain');
    const userStr = await AsyncStorage.getItem('user');

    if (subdomain) {
      config.headers['x-tenant-subdomain'] = subdomain;
    }

    if (userStr) {
      const user = JSON.parse(userStr);
      if (user?.id) {
        config.headers['x-user-id'] = user.id;
      }
    }
  } catch (error) {
    console.error('Error in request interceptor', error);
  }
  return config;
});

export default api;
