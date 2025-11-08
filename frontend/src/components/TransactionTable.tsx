import { useMemo } from 'react';
import { formatDateISO } from '../utils/format';
import { formatCurrency } from '../utils/formatCurrency';
import { Transaction } from '../types';

interface TransactionTableProps {
  transactions: Transaction[];
  onEdit: (transaction: Transaction) => void;
  onDelete: (transaction: Transaction) => void;
  loading: boolean;
  pagination?: {
    page: number;
    totalPages: number;
    total: number;
    limit: number;
  } | null;
  onPaginate: (page: number) => void;
  onLimitChange: (limit: number) => void;
}

export default function TransactionTable({
  transactions,
  onEdit,
  onDelete,
  loading,
  pagination,
  onPaginate,
  onLimitChange,
}: TransactionTableProps) {
  const hasTransactions = transactions.length > 0;

  const summary = useMemo(() => {
    return transactions.reduce(
      (acc, tx) => {
        if (tx.type === 'income') acc.income += tx.amount;
        if (tx.type === 'expense') acc.expense += tx.amount;
        acc.net = acc.income - acc.expense;
        return acc;
      },
      { income: 0, expense: 0, net: 0 }
    );
  }, [transactions]);

  return (
    <div className="rounded-xl bg-white p-6 shadow-lg">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-brand-primary">Transactions</h2>
        <div className="hidden text-sm text-brand-secondary md:flex md:gap-4">
          <div>
            Income:{' '}
            <span className="font-medium text-emerald-600">{formatCurrency(summary.income)}</span>
          </div>
          <div>
            Expense:{' '}
            <span className="font-medium text-red-600">{formatCurrency(summary.expense)}</span>
          </div>
          <div>
            Net:{' '}
            <span className="font-medium text-brand-primary">{formatCurrency(summary.net)}</span>
          </div>
        </div>
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-brand-surface">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-brand-secondary">Date</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-brand-secondary">Category</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-brand-secondary">Type</th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-brand-secondary">Amount</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-brand-secondary">Description</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 text-sm">
            {!loading && !hasTransactions && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-brand-secondary">
                  No transactions found. Try adjusting your filters or add a new transaction.
                </td>
              </tr>
            )}
            {loading && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-brand-secondary">
                  Loading transactions…
                </td>
              </tr>
            )}
            {!loading &&
              transactions.map((transaction) => (
                <tr key={transaction._id} className="hover:bg-brand-surface/60">
                  <td className="px-4 py-3 text-brand-primary">{formatDateISO(transaction.date)}</td>
                  <td className="px-4 py-3 text-brand-primary">{transaction.category}</td>
                  <td className="px-4 py-3 capitalize text-brand-secondary">{transaction.type}</td>
                  <td className="px-4 py-3 text-right font-medium text-brand-primary">
                    {formatCurrency(transaction.amount)}
                  </td>
                  <td className="px-4 py-3 text-brand-secondary">
                    {transaction.description?.length ? transaction.description : '—'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => onEdit(transaction)}
                        className="text-sm font-medium text-brand-accent hover:underline"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(transaction)}
                        className="text-sm font-medium text-red-600 hover:underline"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {pagination && pagination.totalPages > 1 && (
        <div className="mt-4 flex flex-col gap-4 border-t border-gray-100 pt-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2 text-sm text-brand-secondary">
            Rows per page:
            <select
              value={pagination.limit}
              onChange={(event) => onLimitChange(Number(event.target.value))}
              className="rounded border border-gray-200 px-2 py-1 text-brand-primary focus:border-brand-accent focus:outline-none"
            >
              {[10, 20, 50].map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-between gap-4 text-sm text-brand-secondary">
            <span>
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onPaginate(Math.max(1, pagination.page - 1))}
                disabled={pagination.page === 1}
                className="rounded border border-gray-200 px-3 py-1 font-medium text-brand-primary transition hover:bg-brand-surface disabled:cursor-not-allowed disabled:opacity-50"
              >
                Previous
              </button>
              <button
                type="button"
                onClick={() => onPaginate(Math.min(pagination.totalPages, pagination.page + 1))}
                disabled={pagination.page === pagination.totalPages}
                className="rounded border border-gray-200 px-3 py-1 font-medium text-brand-primary transition hover:bg-brand-surface disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
