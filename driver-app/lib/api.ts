import axios from 'axios';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import Constants from 'expo-constants';

// Dynamically get the IP address of your computer running the Expo packager
const debuggerHost = Constants.expoConfig?.hostUri;
const IP = debuggerHost ? debuggerHost.split(':')[0] : 'localhost';

const API_URL = `http://${IP}:3001`;

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
