import apiClient from './axiosConfig';
import axios, { AxiosError } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Account } from '@/types/account';
import { Transaction } from '@/types/transaction';

const handleApiError = async (error: unknown, message: string) => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError;
    console.error(message, axiosError.response?.data || axiosError.message);
    if (axiosError.response?.status === 401) {
      // Unauthorized, token might be invalid or expired
      await AsyncStorage.removeItem('accessToken');
      throw new Error('UNAUTHORIZED');
    }
  } else {
    console.error(message, error);
  }
  throw error;
};

const addBearerToken = async (config: any) => {
  const token = await AsyncStorage.getItem('accessToken');
  if (token) {
    config.headers = {
      ...config.headers,
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  } else {
    throw new Error('NO_TOKEN');
  }
  return config;
};

export const fetchBanks = async () => {
  try {
    const response = await apiClient.get('/banks', { transformRequest: [addBearerToken] });
    console.log('Banks response:', response.data);
    return response.data;
  } catch (error) {
    return handleApiError(error, 'Error fetching banks');
  }
};

export const createBank = async (name: string) => {
  try {
    const response = await apiClient.post('/banks', JSON.stringify({ name }), {
      headers: {
        'Content-Type': 'application/json'
      },
      transformRequest: [(data, headers) => {
        headers['Content-Type'] = 'application/json';
        return JSON.stringify(data);
      }]
    });
    console.log('Bank created:', response.data);
    return response.data;
  } catch (error) {
    return handleApiError(error, 'Error creating bank');
  }
};

export const deleteBank = async (bankId: number) => {
  try {
    const response = await apiClient.delete(`/banks/${bankId}`, { transformRequest: [addBearerToken] });
    console.log('Bank deleted:', response.data);
    return response.data;
  } catch (error) {
    return handleApiError(error, 'Error deleting bank');
  }
};

export const fetchAccounts = async () => {
  try {
    const response = await apiClient.get('/accounts?per_page=1000&page=1', { transformRequest: [addBearerToken] });
    console.log('Accounts response:', response.data);
    return response.data;
  } catch (error) {
    return handleApiError(error, 'Error fetching accounts');
  }
};

export const createAccount = async (accountData: {
  name: string;
  type: string;
  bank_id: number;
  currency: string;
}) => {
  try {
    const response = await apiClient.post('/accounts', accountData, {
      transformRequest: [(data, headers) => {
        headers['Content-Type'] = 'application/json';
        return JSON.stringify(data);
      }]
    });
    return response.data;
  } catch (error) {
    return handleApiError(error, 'Error creating account');
  }
};

export const deleteAccount = async (accountId: number, onSuccess?: () => void) => {
  try {
    const response = await apiClient.delete(`/accounts/${accountId}`, { transformRequest: [addBearerToken] });
    if (response.status === 204 && onSuccess) {
      onSuccess();
    }
    return response.data;
  } catch (error) {
    return handleApiError(error, 'Error deleting account');
  }
};

export const updateAccount = async (accountId: number, accountData: Account) => {
  try {
    const response = await apiClient.put(`/accounts/${accountId}`, accountData, {
      transformRequest: [(data, headers) => {
        headers['Content-Type'] = 'application/json';
        return JSON.stringify(data);
      }]
    });
    return response.data;
  } catch (error) {
    return handleApiError(error, 'Error updating account');
  }
};

export const updateTransaction = async (transactionId: number, transactionData: Transaction) => {
  try {
    const response = await apiClient.put(`/transactions/${transactionId}`, transactionData, {
      transformRequest: [(data, headers) => {
        headers['Content-Type'] = 'application/json';
        return JSON.stringify(data);
      }]
    });
    return response.data;
  } catch (error) {
    return handleApiError(error, 'Error updating transaction');
  }
}

export const fetchTransactions = async (perPage: number, page: number, accountId?: number) => {
  try {
    const response = await apiClient.get(`/transactions?per_page=${perPage}&page=${page}&sort_by=date&sort_order=desc${accountId ? `&account_id=${accountId}` : ''}`, { 
      transformRequest: [addBearerToken] // Added transformRequest
      
    });
    console.log('Transactions length response:', response.data.length);
    return response.data;
  } catch (error) {
    return handleApiError(error, 'Error fetching transactions');
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
    const response = await apiClient.post('/transactions', transactionData, {
      transformRequest: [(data, headers) => {
        headers['Content-Type'] = 'application/json';
        return JSON.stringify(data);
      }]
    });
    return response.data;
  } catch (error) {
    return handleApiError(error, 'Error creating transaction');
  }
};

export const deleteTransaction = async (transactionId: number, onSuccess?: () => void) => {
  try {
    const response = await apiClient.delete(`/transactions/${transactionId}`, { transformRequest: [addBearerToken] });
    if (response.status === 200 && onSuccess) {
      onSuccess();
    }
    return response.data;
  } catch (error) {
    return handleApiError(error, 'Error deleting transaction');
  }
};

export const fetchWealthData = async (startDate: string, endDate: string) => {
  try {
    const response = await apiClient.get(`/accounts/balance_over_time?start_date=${startDate}&end_date=${endDate}`, { transformRequest: [addBearerToken] });
    console.log("wealth data", response.data);
    return response.data;
  } catch (error) {
    return handleApiError(error, 'Error fetching wealth data');
  }
};

export const fetchBudgetSummary = async (startDate: string, endDate: string) => {
  try {
    const response = await apiClient.get(`/budgets/budget_summary?start_date=${startDate}&end_date=${endDate}}`, { transformRequest: [addBearerToken] });
    console.log("budget summary", response.data); // Log the response data
    return response.data;
  } catch (error) {
    return handleApiError(error, 'Error fetching budget summary');
  }
};
