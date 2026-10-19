import { useState } from 'react';
import { selectableDay } from './calendar';

export type CalendarCell = Readonly<{ day: string; number: number; selectable: boolean }> | null;

export function useCalendarViewModel(today: string, blocked: readonly string[]) {
  const firstMonth = today.slice(0, 7);
  const [visibleMonth, setVisibleMonth] = useState(firstMonth);
  const month = visibleMonth < firstMonth ? firstMonth : visibleMonth;
  const [yearNumber, monthNumber] = month.split('-').map(Number);
  const start = new Date(Date.UTC(yearNumber, monthNumber - 1, 1));
  const length = new Date(Date.UTC(yearNumber, monthNumber, 0)).getUTCDate();
  const leading = (start.getUTCDay() + 6) % 7;
  const cells: CalendarCell[] = Array.from({ length: leading + length }, (_, index) => {
    const number = index - leading + 1;
    if (number < 1) return null;
    const day = `${month}-${String(number).padStart(2, '0')}`;
    return { day, number, selectable: selectableDay(day, today, blocked) };
  });
  const title = new Intl.DateTimeFormat('es-MX', { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(start);
  const move = (offset: number) => {
    const next = new Date(Date.UTC(yearNumber, monthNumber - 1 + offset, 1));
    const value = `${next.getUTCFullYear()}-${String(next.getUTCMonth() + 1).padStart(2, '0')}`;
    if (value >= firstMonth) setVisibleMonth(value);
  };
  return { title, cells, canPrevious: month > firstMonth, previous: () => { move(-1); }, next: () => { move(1); } };
}
