import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { Platform } from 'react-native';

const IP = '10.153.19.158'; // Update this if testing on physical mobile device
const API_URL = Platform.OS === 'web' ? 'http://localhost:5000/api' : `http://${IP}:5000/api`; 
export const baseURL = Platform.OS === 'web' ? 'http://localhost:5000' : `http://${IP}:5000`;

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
