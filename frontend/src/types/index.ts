export type TransactionType = 'income' | 'expense';

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface Transaction {
  _id: string;
  userId: string;
  type: TransactionType;
  category: string;
  amount: number;
  date: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TransactionInput {
  type: TransactionType;
  category: string;
  amount: number;
  date: string;
  description?: string;
}

export interface TransactionUpdateInput extends Partial<TransactionInput> {}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface TransactionListResponse {
  data: Transaction[];
  pagination: Pagination;
}

export interface TransactionFilters {
  startDate?: string | null;
  endDate?: string | null;
  categories: string[];
  type?: TransactionType | 'all';
  minAmount?: number | null;
  maxAmount?: number | null;
  sort?: string;
}

export interface CategoryBreakdownItem {
  category: string;
  total: number;
}

export interface MonthlySummaryItem {
  year: number;
  month: number;
  income: number;
  expense: number;
  net: number;
}

export interface NetBalanceSummary {
  income: number;
  expense: number;
  net: number;
}
