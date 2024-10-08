import { Category } from "./category";
export interface Transaction {
  id: number;
  date: string;
  description: string;
  amount: number;
  type: string;
  from_account_id: number;
  to_account_id: number;
  category: string;
  subcategory: string | null;
}