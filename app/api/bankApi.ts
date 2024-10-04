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

export const deleteBank = async (bankId: number) => {
  try {
    const response = await api.delete(`/banks/${bankId}`);
    console.log('Bank deleted:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error deleting bank:', error);
    throw error;
  }
};

export const fetchAccounts = async () => {
  try {
    const response = await api.get('/accounts?per_page=100&page=1');
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

export const deleteAccount = async (accountId: number, onSuccess?: () => void) => {
  try {
    const response = await api.delete(`/accounts/${accountId}`);

    // If deletion is successful and onSuccess callback is provided, call it
    if (response.status === 200 && onSuccess) {
      onSuccess();
    }

    return response.data;
  } catch (error) {
    console.error('Error deleting account:', error);
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
  subCategory: string | null;
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

export const deleteTransaction = async (transactionId: number, onSuccess?: () => void) => {
  try {
    const response = await api.delete(`/transactions/${transactionId}`);
    if (response.status === 200 && onSuccess) {
      onSuccess();
    }
    return response.data;
  } catch (error) {
    console.error('Error deleting transaction:', error);
    throw error;
  }
};
