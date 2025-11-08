import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  CategoryBreakdownItem,
  MonthlySummaryItem,
  NetBalanceSummary,
  TransactionFilters,
} from '../types';
import {
  fetchCategoryBreakdown,
  fetchMonthlySummary,
  fetchNetBalance,
} from '../services/analyticsService';

interface UseAnalyticsOptions {
  filters: TransactionFilters;
  refreshToken: number;
}

export function useAnalytics({ filters, refreshToken }: UseAnalyticsOptions) {
  const [categoryData, setCategoryData] = useState<CategoryBreakdownItem[]>([]);
  const [monthlyData, setMonthlyData] = useState<MonthlySummaryItem[]>([]);
  const [netBalance, setNetBalance] = useState<NetBalanceSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const serializedFilters = useMemo(() => JSON.stringify(filters), [filters]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const parsedFilters = JSON.parse(serializedFilters) as TransactionFilters;
      const [categories, monthly, net] = await Promise.all([
        fetchCategoryBreakdown(parsedFilters),
        fetchMonthlySummary(parsedFilters),
        fetchNetBalance(parsedFilters),
      ]);
      setCategoryData(categories);
      setMonthlyData(monthly);
      setNetBalance(net);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Unable to load analytics data.');
      }
    } finally {
      setLoading(false);
    }
  }, [serializedFilters]);

  useEffect(() => {
    fetchData();
  }, [fetchData, refreshToken]);

  return {
    categoryData,
    monthlyData,
    netBalance,
    loading,
    error,
    refetch: fetchData,
  };
}
