import { calendarDate } from '@/shared/adapters/validation';
import { AdapterError } from '@/shared/adapters/adapter-error';

export function calendarDayFromApi(value: unknown): string {
  const result = calendarDate(value, 'día bloqueado.fecha');
  if (result === null) throw new AdapterError('día bloqueado.fecha', 'fecha de calendario');
  return result;
}

export function localCalendarDay(date: Date): string {
  const year = String(date.getFullYear()).padStart(4, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function selectableDay(value: string, today: string, blocked: readonly string[]): boolean {
  if (!value || value < today || blocked.includes(value)) return false;
  try { return calendarDate(value, 'fecha') === value; }
  catch { return false; }
}
