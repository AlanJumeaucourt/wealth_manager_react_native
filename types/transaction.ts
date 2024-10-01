import { Category } from "./category";
export interface Transaction {
    id: number;
    date: string;
    description: string;
    amount: number;
    type: string;
    fromAccountId: number;
    toAccountId: number;
    category: Category;
  }