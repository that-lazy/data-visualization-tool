import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Transaction,
  TransactionFilters,
  TransactionInput,
  TransactionListResponse,
} from '../types';
import {
  createTransaction,
  deleteTransaction,
  fetchTransactions,
  updateTransaction,
} from '../services/transactionService';

export const initialTransactionFilters: TransactionFilters = {
  startDate: null,
  endDate: null,
  categories: [],
  type: 'all',
  minAmount: null,
  maxAmount: null,
  sort: 'date:desc',
};

const defaultFilters: TransactionFilters = { ...initialTransactionFilters };
const defaultLimit = 10;

function arraysEqual<T>(a: T[], b: T[]) {
  if (a === b) return true;
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i += 1) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

function filtersEqual(a: TransactionFilters, b: TransactionFilters) {
  return (
    a.startDate === b.startDate &&
    a.endDate === b.endDate &&
    a.type === b.type &&
    a.minAmount === b.minAmount &&
    a.maxAmount === b.maxAmount &&
    a.sort === b.sort &&
    arraysEqual(a.categories, b.categories)
  );
}

export function useTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filters, setFilters] = useState<TransactionFilters>(defaultFilters);
  const [pagination, setPagination] = useState<TransactionListResponse['pagination'] | null>(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(defaultLimit);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshIndex, setRefreshIndex] = useState(0);

  const categories = useMemo(() => {
    const unique = new Set<string>();
    transactions.forEach((tx) => unique.add(tx.category));
    return Array.from(unique).sort();
  }, [transactions]);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    fetchTransactions({ ...filters, page, limit })
      .then((response) => {
        if (!isMounted) return;
        setTransactions(response.data);
        setPagination(response.pagination);
      })
      .catch((err) => {
        if (!isMounted) return;
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('Failed to load transactions.');
        }
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [filters, page, limit, refreshIndex]);

  const refetch = useCallback(() => setRefreshIndex((idx) => idx + 1), []);

  const updateFilters = useCallback((updates: Partial<TransactionFilters>) => {
    let didChange = false;
    setFilters((prev) => {
      const nextCategories =
        updates.categories !== undefined ? [...updates.categories] : prev.categories;

      const next: TransactionFilters = {
        ...prev,
        ...updates,
        categories: nextCategories,
      };

      if (filtersEqual(prev, next)) {
        return prev;
      }

      didChange = true;
      return next;
    });

    if (didChange) {
      setPage(1);
    }
  }, []);

  const handleCreate = useCallback(
    async (data: TransactionInput) => {
      await createTransaction(data);
      refetch();
    },
    [refetch]
  );

  const handleUpdate = useCallback(
    async (id: string, data: TransactionInput) => {
      await updateTransaction(id, data);
      refetch();
    },
    [refetch]
  );

  const handleDelete = useCallback(
    async (id: string) => {
      await deleteTransaction(id);
      refetch();
    },
    [refetch]
  );

  const handlePaginate = useCallback((newPage: number) => {
    setPage((prev) => (prev === newPage ? prev : newPage));
  }, []);

  const handleLimitChange = useCallback((newLimit: number) => {
    setLimit((prev) => {
      if (prev === newLimit) {
        return prev;
      }
      return newLimit;
    });
    setPage(1);
  }, []);

  const resetFilters = useCallback(() => {
    let didChange = false;
    setFilters((prev) => {
      if (filtersEqual(prev, defaultFilters)) {
        return prev;
      }
      didChange = true;
      return { ...defaultFilters };
    });
    if (didChange) {
      setPage(1);
      setLimit(defaultLimit);
    }
  }, []);

  return {
    transactions,
    categories,
    filters,
    pagination,
    loading,
    error,
    page,
    limit,
    updateFilters,
    createTransaction: handleCreate,
    updateTransaction: handleUpdate,
    deleteTransaction: handleDelete,
    paginate: handlePaginate,
    setLimit: handleLimitChange,
    refetch,
    refreshToken: refreshIndex,
    resetFilters,
  };
}
