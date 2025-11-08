import { useEffect, useMemo } from 'react';
import { Bar } from 'react-chartjs-2';
import type { MutableRefObject } from 'react';
import type { Chart as ChartJS, ChartOptions } from 'chart.js';
import { MonthlySummaryItem } from '../../types';
import { ensureChartsRegistered } from './chartSetup';
import { getMonthLabel } from '../../utils/format';
import { formatCurrency } from '../../utils/formatCurrency';

interface BarChartProps {
  data: MonthlySummaryItem[];
  chartRef: MutableRefObject<ChartJS<'bar'> | null>;
}

export default function BarChart({ data, chartRef }: BarChartProps) {
  useEffect(() => {
    ensureChartsRegistered();
  }, []);

  const chartData = useMemo(() => {
    return {
      labels: data.map((item) => getMonthLabel(item.year, item.month)),
      datasets: [
        {
          label: 'Income',
          data: data.map((item) => item.income),
          backgroundColor: 'rgba(5, 150, 105, 0.6)',
        },
        {
          label: 'Expense',
          data: data.map((item) => item.expense),
          backgroundColor: 'rgba(239, 68, 68, 0.6)',
        },
      ],
    };
  }, [data]);

  const chartOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const value = context.parsed.y ?? 0;
            return `${context.dataset.label}: ${formatCurrency(value)}`;
          },
        },
      },
    },
    scales: {
      y: {
        ticks: {
          callback: (value) => formatCurrency(Number(value)),
        },
      },
    },
  };

  return (
    <Bar
      ref={(instance) => {
        chartRef.current = (instance as ChartJS<'bar'> | null | undefined) ?? null;
      }}
      data={chartData}
      options={chartOptions}
    />
  );
}
