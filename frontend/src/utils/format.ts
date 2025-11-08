import { format, parseISO } from 'date-fns';

export function formatDateISO(date: string | Date, pattern: string = 'MMM d, yyyy') {
  if (!date) return '';
  const parsed = typeof date === 'string' ? parseISO(date) : date;
  return format(parsed, pattern);
}

export function getMonthLabel(year: number, month: number) {
  const date = new Date(year, month - 1);
  return format(date, 'MMM yyyy');
}
