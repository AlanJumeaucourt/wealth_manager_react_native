import apiClient from './axiosConfig';
import { AxiosResponse } from 'axios';
import { useNavigation } from '@react-navigation/native';

const handleResponse = (response: AxiosResponse) => {
  if (response.status === 401) {
    navigation.navigate('Login');
  }
  return response.data;
};

export const fetchBanks = async () => {
  try {
    const response = await apiClient.get('/banks');
    console.log('Banks response:', response.data); // Add this line for debugging
    return response.data;
  } catch (error: unknown) { // Explicitly typing error
    console.error('Error fetching banks:', (error as any).response?.data || (error as Error).message);
    throw error;
  }
};

export const createBank = async (name: string) => {
  try {
    const response = await apiClient.post('/banks', { name });
    console.log('Bank created:', response.data); // Add this line for debugging
    return response.data;
  } catch (error) {
    console.error('Error creating bank:', error);
    throw error;
  }
};

export const deleteBank = async (bankId: number) => {
  try {
    const response = await apiClient.delete(`/banks/${bankId}`);
    console.log('Bank deleted:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error deleting bank:', error);
    throw error;
  }
};

export const fetchAccounts = async () => {
  try {
    const response = await apiClient.get('/accounts?per_page=1000&page=1');
    console.log('Accounts response:', response.data); // Add this line for debugging
    return response.data;
  } catch (error: unknown) { // Explicitly typing error
    console.error('Error fetching accounts:', (error as any).response?.data || (error as Error).message);
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
    const response = await apiClient.post('/accounts', accountData);
    return response.data;
  } catch (error) {
    console.error('Error creating account:', error);
    throw error;
  }
};

export const deleteAccount = async (accountId: number, onSuccess?: () => void) => {
  try {
    const response = await apiClient.delete(`/accounts/${accountId}`);

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

export const updateAccount = async (accountId: number, accountData: {
  name: string;
  type: string;
  bankId: number;
  currency: string;
}) => {
  try {
    const response = await apiClient.put(`/accounts/${accountId}`, accountData);
    return response.data;
  } catch (error) {
    console.error('Error updating account:', error);
    throw error;
  }
};


export const fetchTransactions = async (perPage: number, page: number, accountId?: number) => {
  try {
    const response = await apiClient.get(`/transactions?per_page=${perPage}&page=${page}&sort_by=date&sort_order=desc${accountId ? `&account_id=${accountId}` : ''}`);
    console.log('Transactions lenth response:', response.data); // Add this line for debugging
    return response.data;
  } catch (error: unknown) { // Explicitly typing error
    console.error('Error fetching transactions:', (error as any).response?.data || (error as Error).message);
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
    const response = await apiClient.post('/transactions', transactionData);
    return response.data;
  } catch (error) {
    console.error('Error creating transaction:', error);
    console.error('Error creating transaction:', error.response?.data || error.message);
    throw error;
  }
};

export const deleteTransaction = async (transactionId: number, onSuccess?: () => void) => {
  try {
    const response = await apiClient.delete(`/transactions/${transactionId}`);
    if (response.status === 200 && onSuccess) {
      onSuccess();
    }
    return response.data;
  } catch (error) {
    console.error('Error deleting transaction:', error);
    throw error;
  }
};

export const fetchWealthData = async (startDate: string, endDate: string) => {
  const response = await apiClient.get(`/accounts/balance_over_time?start_date=${startDate}&end_date=${endDate}`);
  console.log("wealth data", response.data);
  return response.data;
};
