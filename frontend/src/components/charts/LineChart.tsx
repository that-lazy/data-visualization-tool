import { useEffect, useMemo } from 'react';
import { Line } from 'react-chartjs-2';
import type { Chart as ChartJS, ChartOptions } from 'chart.js';
import type { MutableRefObject } from 'react';
import { MonthlySummaryItem } from '../../types';
import { ensureChartsRegistered } from './chartSetup';
import { getMonthLabel } from '../../utils/format';
import { formatCurrency } from '../../utils/formatCurrency';

interface LineChartProps {
  data: MonthlySummaryItem[];
  chartRef: MutableRefObject<ChartJS<'line'> | null>;
}

export default function LineChart({ data, chartRef }: LineChartProps) {
  useEffect(() => {
    ensureChartsRegistered();
  }, []);

  const chartData = useMemo(() => {
    return {
      labels: data.map((item) => getMonthLabel(item.year, item.month)),
      datasets: [
        {
          label: 'Net Balance',
          data: data.map((item) => item.net),
          borderColor: '#2563EB',
          backgroundColor: 'rgba(37, 99, 235, 0.1)',
          fill: true,
          tension: 0.4,
        },
      ],
    };
  }, [data]);

  const chartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context) => `Net: ${formatCurrency(context.parsed.y ?? 0)}`,
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
    <Line
      ref={(instance) => {
        chartRef.current = (instance as ChartJS<'line'> | null | undefined) ?? null;
      }}
      data={chartData}
      options={chartOptions}
    />
  );
}
