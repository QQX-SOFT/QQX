import axios from 'axios';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import Constants from 'expo-constants';

// Production Vercel URL
const PRODUCTION_URL = 'https://qqx-sgxb.vercel.app';

// Dynamically get the IP address of your computer running the Expo packager
// If we are in production or IP detection fails, use the production URL
const debuggerHost = Constants.expoConfig?.hostUri;
const IP = debuggerHost ? debuggerHost.split(':')[0] : null;

const API_URL = (IP && IP !== 'localhost') 
  ? `http://${IP}:3001` 
  : PRODUCTION_URL;

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
