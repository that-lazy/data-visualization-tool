import { useEffect, useMemo } from 'react';
import { Doughnut } from 'react-chartjs-2';
import type { Chart as ChartJS, ChartOptions } from 'chart.js';
import type { MutableRefObject } from 'react';
import { CategoryBreakdownItem } from '../../types';
import { ensureChartsRegistered } from './chartSetup';
import { formatCurrency } from '../../utils/formatCurrency';

interface PieChartProps {
  data: CategoryBreakdownItem[];
  chartRef: MutableRefObject<ChartJS<'doughnut'> | null>;
}

export default function PieChart({ data, chartRef }: PieChartProps) {
  useEffect(() => {
    ensureChartsRegistered();
  }, []);

  const chartData = useMemo(() => {
    return {
      labels: data.map((item) => item.category),
      datasets: [
        {
          data: data.map((item) => item.total),
          backgroundColor: [
            '#2563EB',
            '#7C3AED',
            '#059669',
            '#F97316',
            '#DB2777',
            '#111827',
          ],
          borderWidth: 0,
        },
      ],
    };
  }, [data]);

  const chartOptions: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 16,
          usePointStyle: true,
        },
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const value = context.parsed;
            const label = context.label ?? '';
            return `${label}: ${formatCurrency(typeof value === 'number' ? value : 0)}`;
          },
        },
      },
    },
  };

  return (
    <Doughnut
      ref={(instance) => {
        chartRef.current = (instance as ChartJS<'doughnut'> | null | undefined) ?? null;
      }}
      data={chartData}
      options={chartOptions}
    />
  );
}
