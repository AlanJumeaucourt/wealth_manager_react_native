import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_URL } from '../config';
import { useRouter } from 'expo-router'; // Import useRouter

export const setAuthToken = (token: string) => {
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete axios.defaults.headers.common['Authorization'];
  }
};

export const refreshAccessToken = async () => {
  try {
    const refreshToken = await AsyncStorage.getItem('refreshToken');
    if (!refreshToken) {
      throw new Error('No refresh token found');
    }

    const response = await axios.post(`${API_URL}/refresh`, {}, {
      headers: { Authorization: `Bearer ${refreshToken}` }
    });

    const { access_token } = response.data;
    await AsyncStorage.setItem('accessToken', access_token);
    setAuthToken(access_token);

    return access_token;
  } catch (error) {
    console.error('Error refreshing token:', error);
    await AsyncStorage.removeItem('accessToken');
    await AsyncStorage.removeItem('refreshToken');
    throw error;
  }
};

export const setupAxiosInterceptors = (router: any) => { // Accept router as a parameter
  axios.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;
      if (error.response.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        try {
          const access_token = await refreshAccessToken();
          originalRequest.headers['Authorization'] = `Bearer ${access_token}`;
          return axios(originalRequest);
        } catch (refreshError) {
          // Redirect to login on refresh error
          console.error('Redirecting to login due to refresh error:', refreshError);
          router.replace('/login'); // Redirect to login page
          return Promise.reject(refreshError);
        }
      }
      return Promise.reject(error);
    }
  );
};