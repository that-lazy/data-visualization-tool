import { useMemo, useState } from 'react';
import { useAuthContext } from '../context/AuthContext';
import { Transaction, TransactionInput } from '../types';
import { useTransactions } from '../hooks/useTransactions';
import { useAnalytics } from '../hooks/useAnalytics';
import AddTransactionForm from '../components/AddTransactionForm';
import TransactionTable from '../components/TransactionTable';
import FiltersPanel from '../components/FiltersPanel';
import ChartArea from '../components/ChartArea';
import { formatCurrency } from '../utils/formatCurrency';

export default function DashboardPage() {
  const { user, logout } = useAuthContext();
  const {
    transactions,
    categories,
    filters,
    pagination,
    loading,
    error,
    page,
    limit,
    updateFilters,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    paginate,
    setLimit,
    refetch,
    refreshToken,
    resetFilters,
  } = useTransactions();

  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  const analytics = useAnalytics({ filters, refreshToken });

  const combinedLoading = loading || analytics.loading;

  const transactionError = error || analytics.error;

  const handleDelete = async (transaction: Transaction) => {
    const confirmDelete = window.confirm(
      `Delete transaction "${transaction.category}" for ${formatCurrency(transaction.amount)}?`
    );
    if (!confirmDelete) return;
    await deleteTransaction(transaction._id);
    refetch();
  };

  const handleCreate = async (data: TransactionInput) => {
    await createTransaction(data);
    refetch();
  };

  const handleUpdate = async (id: string, data: TransactionInput) => {
    await updateTransaction(id, data);
    setEditingTransaction(null);
    refetch();
  };

  const dashboardGreeting = useMemo(() => {
    if (!user) return 'Welcome';
    const now = new Date();
    const hour = now.getHours();
    if (hour < 12) return `Good morning, ${user.name}`;
    if (hour < 18) return `Good afternoon, ${user.name}`;
    return `Good evening, ${user.name}`;
  }, [user]);

  return (
    <div className="min-h-screen bg-brand-surface">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div>
            <h1 className="text-2xl font-semibold text-brand-primary">Finance Analytics Dashboard</h1>
            <p className="text-sm text-brand-secondary">{dashboardGreeting}</p>
          </div>
          <div className="flex items-center gap-4">
            {user && (
              <span className="hidden text-sm text-brand-secondary sm:inline">{user.email}</span>
            )}
            <button
              type="button"
              onClick={logout}
              className="rounded-md border border-gray-200 px-3 py-1.5 text-sm font-medium text-brand-primary transition hover:bg-brand-surface"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-6 px-4 py-6">
        {transactionError && (
          <div className="rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {transactionError}
          </div>
        )}

        <FiltersPanel
          filters={filters}
          categories={categories}
          onChange={updateFilters}
          onReset={() => {
            resetFilters();
            refetch();
          }}
        />

        <AddTransactionForm
          onSubmit={handleCreate}
          onUpdate={handleUpdate}
          editingTransaction={editingTransaction}
          onCancelEdit={() => setEditingTransaction(null)}
          categories={categories}
        />

        <TransactionTable
          transactions={transactions}
          onEdit={(transaction) => setEditingTransaction(transaction)}
          onDelete={handleDelete}
          loading={loading}
          pagination={pagination && {
            page,
            totalPages: pagination.totalPages,
            total: pagination.total,
            limit,
          }}
          onPaginate={paginate}
          onLimitChange={setLimit}
        />

        <ChartArea
          monthlyData={analytics.monthlyData}
          categoryData={analytics.categoryData}
          netBalance={analytics.netBalance}
          loading={combinedLoading}
          onRefresh={() => {
            refetch();
            analytics.refetch();
          }}
        />
      </main>
    </div>
  );
}
