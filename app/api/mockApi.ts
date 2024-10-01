import { Account } from '@/types/account';
import { Transaction } from '@/types/transaction';

// Mock data
export const mockAccounts: Account[] = [
  { id: 1, name: 'Compte Courant', balance: 1500, bank: { id: 1, name: 'BNP Paribas' }, type: 'checking' },
  { id: 2, name: 'Livret A', balance: 5000, bank: { id: 1, name: 'BNP Paribas' }, type: 'saving' },
  { id: 3, name: 'PEL', balance: 7000, bank: { id: 2, name: 'Société Générale' }, type: 'investment' },
  { id: 4, name: 'Compte Joint', balance: 3000, bank: { id: 3, name: 'Crédit Agricole' }, type: 'checking' },
  { id: 5, name: 'PEA', balance: 10000, bank: { id: 4, name: 'Société Générale' }, type: 'investment' },
  { id: 6, name: 'CTO', balance: 12000, bank: { id: 4, name: 'Société Générale' }, type: 'investment' },
  { id: 7, name: 'Fake expense', balance: 0, bank: { id: 5, name: 'Fake bank' }, type: 'expense' },
  { id: 8, name: 'Fake income', balance: 0, bank: { id: 5, name: 'Fake bank' }, type: 'income' }
];

export const mockTransactions: Transaction[] = [
    { id: 1, date: '2023-03-15', description: 'Grocery Store',  amount: 75.50, type: 'expense', fromAccountId: 1, toAccountId: 8, category: { name: 'Food', subCategories: [] } },
    { id: 2, date: '2023-03-15', description: 'Gas Station', amount: 50.00, type: 'expense', fromAccountId: 1, toAccountId: 8, category: { name: 'Transport', subCategories: [] } },
    { id: 3, date: '2023-03-14', description: 'Salary', amount: 2500.00, type: 'income', fromAccountId: 9, toAccountId: 1, category: { name: 'Salary', subCategories: [] } },
    { id: 4, date: '2023-03-13', description: 'Restaurant', amount: 45.00, type: 'expense', fromAccountId: 1, toAccountId: 8, category: { name: 'Food', subCategories: [] } },
    { id: 5, date: '2023-03-13', description: 'Coffee', amount: 5.00, type: 'expense', fromAccountId: 1, toAccountId: 8, category: { name: 'Food', subCategories: [] } },
    { id: 6, date: '2023-03-12', description: 'Dinner', amount: 100.00, type: 'expense', fromAccountId: 1, toAccountId: 8, category: { name: 'Food', subCategories: [] } },
    { id: 7, date: '2023-03-12', description: 'Groceries', amount: 150.00, type: 'expense', fromAccountId: 1, toAccountId: 8, category: { name: 'Food', subCategories: [] } },
    { id: 8, date: '2023-03-12', description: 'Gas', amount: 30.00, type: 'expense', fromAccountId: 1, toAccountId: 8, category: { name: 'Transport', subCategories: [] } },
    { id: 9, date: '2023-03-12', description: 'Transfer', amount: 1000.00, type: 'transfer', fromAccountId: 1, toAccountId: 2, category: { name: 'Transfer', subCategories: [] } },
    { id: 10, date: '2023-03-11', description: 'Transfer', amount: 2000.00, type: 'transfer', fromAccountId: 2, toAccountId: 1, category: { name: 'Transfer', subCategories: [] } },
    { id: 11, date: '2023-03-11', description: 'Coffee', amount: 5.00, type: 'expense', fromAccountId: 1, toAccountId: 8, category: { name: 'Food', subCategories: [] } },
  ];

export const wealthOverTimeData = Array.from({ length: 60 }, (_, index) => ({
  x: index + 1,
  y: 37000 + (index * 100)
}));

// Mock API functions
export const fetchAccounts = async (): Promise<Account[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  return mockAccounts;
};

export const fetchWealthOverTime = async () => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  return wealthOverTimeData;
};

