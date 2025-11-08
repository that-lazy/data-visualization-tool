import { MutableRefObject, useMemo, useRef } from 'react';
import type { Chart as ChartJS } from 'chart.js';
import { CategoryBreakdownItem, MonthlySummaryItem, NetBalanceSummary } from '../types';
import LineChart from './charts/LineChart';
import PieChart from './charts/PieChart';
import BarChart from './charts/BarChart';
import { formatCurrency } from '../utils/formatCurrency';

interface ChartAreaProps {
  monthlyData: MonthlySummaryItem[];
  categoryData: CategoryBreakdownItem[];
  netBalance: NetBalanceSummary | null;
  loading: boolean;
  onRefresh: () => void;
}

export default function ChartArea({ monthlyData, categoryData, netBalance, loading, onRefresh }: ChartAreaProps) {
  const lineChartRef = useRef<ChartJS<'line'> | null>(null);
  const pieChartRef = useRef<ChartJS<'doughnut'> | null>(null);
  const barChartRef = useRef<ChartJS<'bar'> | null>(null);

  const summaryCards = useMemo(() => {
    if (!netBalance) {
      return [
        { label: 'Income', value: formatCurrency(0), tone: 'text-emerald-600' },
        { label: 'Expense', value: formatCurrency(0), tone: 'text-red-600' },
        { label: 'Net Balance', value: formatCurrency(0), tone: 'text-brand-primary' },
      ];
    }
    return [
      { label: 'Income', value: formatCurrency(netBalance.income), tone: 'text-emerald-600' },
      { label: 'Expense', value: formatCurrency(netBalance.expense), tone: 'text-red-600' },
      { label: 'Net Balance', value: formatCurrency(netBalance.net), tone: 'text-brand-primary' },
    ];
  }, [netBalance]);

  const memoizedCategoryData = useMemo(() => categoryData, [categoryData]);
  const memoizedMonthlyData = useMemo(() => monthlyData, [monthlyData]);

  const handleExport = (chartRef: MutableRefObject<ChartJS | null>, filename: string) => {
    const chart = chartRef.current;
    if (!chart) return;
    const link = document.createElement('a');
    link.href = chart.toBase64Image('image/png', 1);
    link.download = `${filename}.png`;
    link.click();
  };

  return (
    <section className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {summaryCards.map((card) => (
          <div key={card.label} className="rounded-xl bg-white p-5 shadow-lg">
            <p className="text-sm text-brand-secondary">{card.label}</p>
            <p className={`mt-2 text-2xl font-semibold ${card.tone}`}>{card.value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-xl bg-white p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-brand-primary">Net balance trends</h3>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => handleExport(lineChartRef, 'net-balance-trend')}
                className="text-sm font-medium text-brand-accent hover:underline"
              >
                Export PNG
              </button>
              <button
                type="button"
                onClick={onRefresh}
                disabled={loading}
                className="text-sm font-medium text-brand-secondary hover:text-brand-primary disabled:cursor-not-allowed disabled:opacity-60"
              >
                Refresh
              </button>
            </div>
          </div>
          <div className="mt-4 h-72">
            {loading ? (
              <div className="flex h-full items-center justify-center text-brand-secondary">Loading chart…</div>
            ) : (
              <LineChart data={memoizedMonthlyData} chartRef={lineChartRef} />
            )}
          </div>
        </div>

        <div className="grid gap-5">
          <div className="rounded-xl bg-white p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-brand-primary">Category distribution</h3>
              <button
                type="button"
                onClick={() => handleExport(pieChartRef, 'category-distribution')}
                className="text-sm font-medium text-brand-accent hover:underline"
              >
                Export PNG
              </button>
            </div>
            <div className="mt-4 h-64">
              {loading ? (
                <div className="flex h-full items-center justify-center text-brand-secondary">Loading chart…</div>
              ) : (
                <PieChart data={memoizedCategoryData} chartRef={pieChartRef} />
              )}
            </div>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-brand-primary">Income vs expense</h3>
              <button
                type="button"
                onClick={() => handleExport(barChartRef, 'income-vs-expense')}
                className="text-sm font-medium text-brand-accent hover:underline"
              >
                Export PNG
              </button>
            </div>
            <div className="mt-4 h-64">
              {loading ? (
                <div className="flex h-full items-center justify-center text-brand-secondary">Loading chart…</div>
              ) : (
                <BarChart data={memoizedMonthlyData} chartRef={barChartRef} />
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
