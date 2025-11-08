import api from './api';
import { CategoryBreakdownItem, MonthlySummaryItem, NetBalanceSummary, TransactionFilters } from '../types';

function buildParams(filters: Partial<TransactionFilters>) {
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

  return params;
}

export async function fetchCategoryBreakdown(filters: Partial<TransactionFilters>) {
  const params = buildParams(filters);
  const response = await api.get<{ data: CategoryBreakdownItem[] }>('/analytics/category-breakdown', {
    params,
  });
  return response.data.data;
}

export async function fetchMonthlySummary(filters: Partial<TransactionFilters>) {
  const params = buildParams(filters);
  const response = await api.get<{ data: MonthlySummaryItem[] }>('/analytics/monthly-summary', {
    params,
  });
  return response.data.data;
}

export async function fetchNetBalance(filters: Partial<TransactionFilters>) {
  const params = buildParams(filters);
  const response = await api.get<{ data: NetBalanceSummary }>('/analytics/net-balance', {
    params,
  });
  return response.data.data;
}
