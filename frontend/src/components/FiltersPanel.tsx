import { FormEvent, useEffect, useMemo, useState } from 'react';
import clsx from 'clsx';
import { TransactionFilters, TransactionType } from '../types';
import { DEFAULT_AMOUNT_RANGE } from '../constants/filters';
import { formatCurrency } from '../utils/formatCurrency';

interface FiltersPanelProps {
  filters: TransactionFilters;
  categories: string[];
  onChange: (filters: Partial<TransactionFilters>) => void;
  onReset: () => void;
}

export default function FiltersPanel({ filters, categories, onChange, onReset }: FiltersPanelProps) {
  const [localFilters, setLocalFilters] = useState<TransactionFilters>(filters);
  const [amountRange, setAmountRange] = useState({
    min: filters.minAmount ?? DEFAULT_AMOUNT_RANGE.min,
    max: filters.maxAmount ?? DEFAULT_AMOUNT_RANGE.max,
  });

  useEffect(() => {
    setLocalFilters(filters);
    setAmountRange({
      min: filters.minAmount ?? DEFAULT_AMOUNT_RANGE.min,
      max: filters.maxAmount ?? DEFAULT_AMOUNT_RANGE.max,
    });
  }, [filters]);

  const sortedCategories = useMemo(() => categories.slice().sort(), [categories]);

  const handleInputChange = <K extends keyof TransactionFilters>(key: K, value: TransactionFilters[K]) => {
    setLocalFilters((prev) => ({ ...prev, [key]: value }));
    onChange({ [key]: value } as Partial<TransactionFilters>);
  };

  const handleCategoryToggle = (category: string) => {
    setLocalFilters((prev) => {
      const exists = prev.categories.includes(category);
      const categories = exists
        ? prev.categories.filter((item) => item !== category)
        : [...prev.categories, category];
      onChange({ categories });
      return { ...prev, categories };
    });
  };

  const handleAmountChange = (key: 'min' | 'max', value: number) => {
    setAmountRange((prev) => {
      const next = { ...prev, [key]: value } as const;
      onChange({
        minAmount: next.min,
        maxAmount: next.max,
      });
      return next;
    });
  };

  const handleReset = (event: FormEvent) => {
    event.preventDefault();
    onReset();
  };

  return (
    <form onSubmit={handleReset} className="rounded-xl bg-white p-6 shadow-lg">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-brand-primary">Filters</h2>
        <button
          type="submit"
          className="text-sm font-medium text-brand-accent hover:underline"
        >
          Reset
        </button>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        <div className="space-y-2">
          <label className="text-sm font-medium text-brand-secondary" htmlFor="startDate">
            Start date
          </label>
          <input
            id="startDate"
            type="date"
            value={localFilters.startDate ?? ''}
            onChange={(event) => handleInputChange('startDate', event.target.value || null)}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-brand-primary focus:border-brand-accent focus:outline-none focus:ring-2 focus:ring-brand-accent/20"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-brand-secondary" htmlFor="endDate">
            End date
          </label>
          <input
            id="endDate"
            type="date"
            value={localFilters.endDate ?? ''}
            onChange={(event) => handleInputChange('endDate', event.target.value || null)}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-brand-primary focus:border-brand-accent focus:outline-none focus:ring-2 focus:ring-brand-accent/20"
          />
        </div>

        <div className="space-y-2">
          <span className="text-sm font-medium text-brand-secondary">Type</span>
          <div className="flex gap-2">
            {(['all', 'income', 'expense'] as NonNullable<TransactionFilters['type']>[]).map((typeOption) => (
              <button
                key={typeOption}
                type="button"
                onClick={() => handleInputChange('type', typeOption)}
                className={clsx(
                  'rounded-full border px-4 py-2 text-sm font-medium transition',
                  localFilters.type === typeOption
                    ? 'border-brand-accent bg-brand-accent text-white'
                    : 'border-gray-200 text-brand-secondary hover:border-brand-accent hover:text-brand-primary'
                )}
              >
                {typeOption === 'all' ? 'All' : typeOption.charAt(0).toUpperCase() + typeOption.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2 md:col-span-2 xl:col-span-3">
          <span className="text-sm font-medium text-brand-secondary">Categories</span>
          <div className="flex flex-wrap gap-2">
            {sortedCategories.length === 0 && (
              <p className="text-sm text-brand-secondary">Add transactions to see category filters.</p>
            )}
            {sortedCategories.map((category) => {
              const active = localFilters.categories.includes(category);
              return (
                <button
                  key={category}
                  type="button"
                  onClick={() => handleCategoryToggle(category)}
                  className={clsx(
                    'rounded-full border px-3 py-1 text-sm transition',
                    active
                      ? 'border-brand-accent bg-brand-accent text-white'
                      : 'border-gray-200 text-brand-secondary hover:border-brand-accent hover:text-brand-primary'
                  )}
                >
                  {category}
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between text-sm text-brand-secondary">
            <span>Amount range</span>
            <span>
              {formatCurrency(amountRange.min)} – {formatCurrency(amountRange.max)}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min={DEFAULT_AMOUNT_RANGE.min}
              max={DEFAULT_AMOUNT_RANGE.max}
              step={50}
              value={amountRange.min}
              onChange={(event) => handleAmountChange('min', Number(event.target.value))}
              className="w-full"
            />
            <input
              type="range"
              min={DEFAULT_AMOUNT_RANGE.min}
              max={DEFAULT_AMOUNT_RANGE.max}
              step={50}
              value={amountRange.max}
              onChange={(event) => handleAmountChange('max', Number(event.target.value))}
              className="w-full"
            />
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm text-brand-secondary">
            <input
              type="number"
              min={DEFAULT_AMOUNT_RANGE.min}
              max={DEFAULT_AMOUNT_RANGE.max}
              value={amountRange.min}
              onChange={(event) => handleAmountChange('min', Number(event.target.value))}
              className="rounded-lg border border-gray-200 px-3 py-2 text-brand-primary focus:border-brand-accent focus:outline-none"
            />
            <input
              type="number"
              min={DEFAULT_AMOUNT_RANGE.min}
              max={DEFAULT_AMOUNT_RANGE.max}
              value={amountRange.max}
              onChange={(event) => handleAmountChange('max', Number(event.target.value))}
              className="rounded-lg border border-gray-200 px-3 py-2 text-brand-primary focus:border-brand-accent focus:outline-none"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-brand-secondary" htmlFor="sort">
            Sort by
          </label>
          <select
            id="sort"
            value={localFilters.sort ?? 'date:desc'}
            onChange={(event) => handleInputChange('sort', event.target.value)}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-brand-primary focus:border-brand-accent focus:outline-none focus:ring-2 focus:ring-brand-accent/20"
          >
            <option value="date:desc">Date (newest)</option>
            <option value="date:asc">Date (oldest)</option>
            <option value="amount:desc">Amount (highest)</option>
            <option value="amount:asc">Amount (lowest)</option>
            <option value="category:asc">Category (A-Z)</option>
          </select>
        </div>
      </div>
    </form>
  );
}
