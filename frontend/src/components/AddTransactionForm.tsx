import { FormEvent, useEffect, useMemo, useState } from 'react';
import { format } from 'date-fns';
import { Transaction, TransactionInput, TransactionType } from '../types';

interface AddTransactionFormProps {
  onSubmit: (data: TransactionInput) => Promise<void>;
  onUpdate: (id: string, data: TransactionInput) => Promise<void>;
  editingTransaction: Transaction | null;
  onCancelEdit: () => void;
  categories: string[];
}

const createDefaultForm = (): TransactionInput => ({
  type: 'expense',
  category: '',
  amount: 0,
  date: format(new Date(), 'yyyy-MM-dd'),
  description: '',
});

export default function AddTransactionForm({
  onSubmit,
  onUpdate,
  editingTransaction,
  onCancelEdit,
  categories,
}: AddTransactionFormProps) {
  const [form, setForm] = useState<TransactionInput>(createDefaultForm());
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (editingTransaction) {
      setForm({
        type: editingTransaction.type,
        category: editingTransaction.category,
        amount: editingTransaction.amount,
        date: format(new Date(editingTransaction.date), 'yyyy-MM-dd'),
        description: editingTransaction.description ?? '',
      });
    } else {
      setForm(createDefaultForm());
    }
  }, [editingTransaction]);

  const categoryOptions = useMemo(() => {
    const set = new Set(categories);
    if (editingTransaction) {
      set.add(editingTransaction.category);
    }
    return Array.from(set).sort();
  }, [categories, editingTransaction]);

  const handleChange = (key: keyof TransactionInput, value: string | number) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const payload: TransactionInput = {
        ...form,
        amount: Math.max(0, Number(form.amount)),
      };
      if (editingTransaction) {
        await onUpdate(editingTransaction._id, payload);
        onCancelEdit();
      } else {
        await onSubmit(payload);
      }
      setForm(createDefaultForm());
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Unable to save transaction. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="rounded-xl bg-white p-6 shadow-lg">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-brand-primary">
          {editingTransaction ? 'Edit transaction' : 'Add new transaction'}
        </h2>
        {editingTransaction && (
          <button
            type="button"
            onClick={onCancelEdit}
            className="text-sm font-medium text-brand-accent hover:underline"
          >
            Cancel edit
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium text-brand-secondary" htmlFor="type">
            Type
          </label>
          <div className="flex gap-3">
            {(['income', 'expense'] as TransactionType[]).map((typeOption) => (
              <label key={typeOption} className="flex items-center gap-2 text-sm text-brand-primary">
                <input
                  type="radio"
                  name="type"
                  value={typeOption}
                  checked={form.type === typeOption}
                  onChange={() => handleChange('type', typeOption)}
                />
                <span className="capitalize">{typeOption}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-brand-secondary" htmlFor="category">
            Category
          </label>
          <input
            id="category"
            type="text"
            list="category-options"
            value={form.category}
            onChange={(event) => handleChange('category', event.target.value)}
            required
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-brand-primary focus:border-brand-accent focus:outline-none focus:ring-2 focus:ring-brand-accent/20"
            placeholder="e.g. Groceries"
          />
          <datalist id="category-options">
            {categoryOptions.map((category) => (
              <option key={category} value={category} />
            ))}
          </datalist>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-brand-secondary" htmlFor="amount">
            Amount
          </label>
          <input
            id="amount"
            type="number"
            min={0}
            step={0.01}
            value={form.amount}
            onChange={(event) => handleChange('amount', event.target.value === '' ? 0 : Number(event.target.value))}
            required
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-brand-primary focus:border-brand-accent focus:outline-none focus:ring-2 focus:ring-brand-accent/20"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-brand-secondary" htmlFor="date">
            Date
          </label>
          <input
            id="date"
            type="date"
            value={form.date}
            max={format(new Date(), 'yyyy-MM-dd')}
            onChange={(event) => handleChange('date', event.target.value)}
            required
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-brand-primary focus:border-brand-accent focus:outline-none focus:ring-2 focus:ring-brand-accent/20"
          />
        </div>

        <div className="md:col-span-2">
          <label className="text-sm font-medium text-brand-secondary" htmlFor="description">
            Description (optional)
          </label>
          <textarea
            id="description"
            value={form.description}
            onChange={(event) => handleChange('description', event.target.value)}
            rows={3}
            className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-brand-primary focus:border-brand-accent focus:outline-none focus:ring-2 focus:ring-brand-accent/20"
            placeholder="Add a short note"
          />
        </div>

        {error && (
          <p className="md:col-span-2 text-sm text-red-600" role="alert">
            {error}
          </p>
        )}

        <div className="md:col-span-2 flex justify-end">
          <button
            type="submit"
            disabled={submitting}
            className="rounded-lg bg-brand-accent px-5 py-2 font-semibold text-white transition hover:bg-brand-accent/90 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {submitting ? (editingTransaction ? 'Updating…' : 'Adding…') : editingTransaction ? 'Update transaction' : 'Add transaction'}
          </button>
        </div>
      </form>
    </div>
  );
}
