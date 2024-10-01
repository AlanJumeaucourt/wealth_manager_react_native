import { Bank } from './bank';

export interface Account {
  id: number;
  name: string;
  type: 'checking' | 'saving' | 'investment' | 'expense' | 'income';
  balance: number;
  bank: Bank;
}