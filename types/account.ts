export interface Account {
  id: number;
  name: string;
  type: 'checking' | 'savings' | 'investment' | 'expense' | 'income';
  balance: number;
  bankId: number;
}