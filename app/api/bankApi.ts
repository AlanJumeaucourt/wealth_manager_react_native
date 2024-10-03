import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../../config';
const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const fetchBanks = async () => {
  try {
    const response = await api.get('/banks');
    console.log('Banks response:', response.data); // Add this line for debugging
    return response.data;
  } catch (error) {
    console.error('Error fetching banks:', error.response?.data || error.message);
    throw error;
  }
};

export const createBank = async (name: string) => {
  try {
    const response = await api.post('/banks', { name });
    console.log('Bank created:', response.data); // Add this line for debugging
    return response.data;
  } catch (error) {
    console.error('Error creating bank:', error);
    throw error;
  }
};

export const fetchAccounts = async () => {
  try {
    const response = await api.get('/accounts');
    console.log('Accounts response:', response.data); // Add this line for debugging
    return response.data;
  } catch (error) {
    console.error('Error fetching accounts:', error.response?.data || error.message);
    throw error;
  }
};

export const createAccount = async (accountData: {
  name: string;
  type: string;
  bankId: number;
  currency: string;
}) => {
  try {
    const response = await api.post('/accounts', accountData);
    return response.data;
  } catch (error) {
    console.error('Error creating account:', error);
    throw error;
  }
};

export const createTransaction = async (transactionData: {
  date: string;
  description: string;
  amount: number;
  type: string;
  fromAccountId: number;
  toAccountId: number;
  category: string;
  subCategory: string;
}) => {
  try {
    const response = await api.post('/transactions', transactionData);
    return response.data;
  } catch (error) {
    console.error('Error creating transaction:', error);
    console.error('Error creating transaction:', error.response?.data || error.message);
    throw error;
  }
};
