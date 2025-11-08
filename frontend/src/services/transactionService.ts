import api from './api';
import {
  Transaction,
  TransactionInput,
  TransactionListResponse,
  TransactionUpdateInput,
  TransactionFilters,
} from '../types';

export async function fetchTransactions(filters: Partial<TransactionFilters> & { page?: number; limit?: number }) {
  const params: Record<string, string | number> = {};

  Object.entries(filters).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    if (key === 'type' && value === 'all') return;
    if (Array.isArray(value)) {
      if (value.length) params[key] = value.join(',');
      return;
    }
    params[key] = value as string | number;
  });

  const response = await api.get<TransactionListResponse>('/transactions', { params });
  return response.data;
}

export async function createTransaction(payload: TransactionInput) {
  const response = await api.post<Transaction>('/transactions', payload);
  return response.data;
}

export async function updateTransaction(id: string, updates: TransactionUpdateInput) {
  const response = await api.patch<Transaction>(`/transactions/${id}`, updates);
  return response.data;
}

export async function deleteTransaction(id: string) {
  await api.delete(`/transactions/${id}`);
}
