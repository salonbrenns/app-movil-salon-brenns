import { act, renderHook } from '@testing-library/react-native';
import { cents, day, hour, money } from '@/shared/adapters/account-validation';
import { importeReserva } from '@/shared/adapters/transferencia-adapter';
import { calendarDayFromApi, selectableDay } from '@/shared/viewmodels/calendar';
import { usePaginationViewModel } from '@/shared/viewmodels/use-pagination-view-model';

describe('Reserva y calendario', () => {
  test('valida fechas y horas antes de consultar disponibilidad', () => {
    expect(day('2024-02-29')).toBe('2024-02-29');
    expect(() => day('2025-02-29')).toThrow();
    expect(hour('23:59')).toBe('23:59');
    expect(() => hour('24:00')).toThrow();
    expect(calendarDayFromApi('2024-02-29T00:00:00.000Z')).toBe('2024-02-29');
    expect(selectableDay('2026-10-19', '2026-10-18', ['2026-10-19'])).toBe(false);
    expect(selectableDay('2026-10-20', '2026-10-18', [])).toBe(true);
  });

  test('calcula importes en centavos sin pérdida de precisión', () => {
    expect(money(12345n)).toBe('123.45');
    expect(money(1234567890123456789012345n)).toBe('12345678901234567890123.45');
    expect(cents('12345678901234567890123.45')).toBe(1234567890123456789012345n);
    expect(importeReserva('100.01', 'COMPLETO', 50)).toBe('100.01');
    expect(importeReserva('100.01', 'ANTICIPO', 50)).toBe('50.01');
    expect(() => importeReserva('-1.00', 'COMPLETO', 50)).toThrow();
    for (const malformed of ['-', '.5', '1.', '1.234', '1e2', '1,00']) {
      expect(() => cents(malformed)).toThrow();
    }
    expect(() => importeReserva('9'.repeat(100_000) + 'x', 'COMPLETO', 50)).toThrow();
  });
});

describe('Paginación de productos', () => {
  test('muestra diez elementos, acota páginas y se reinicia al cambiar filtros', () => {
    const products = Array.from({ length: 23 }, (_, id) => ({ id }));
    return renderHook(
      ({ key, items }: { key: string; items: readonly { id: number }[] }) => usePaginationViewModel(items, key),
      { initialProps: { key: 'todos', items: products } },
    ).then(async ({ result, rerender }) => {
      expect(result.current.items.map((item) => item.id)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
      expect(result.current.totalPages).toBe(3);
      await act(() => { result.current.next(); });
      expect(result.current.currentPage).toBe(2);
      await act(() => { result.current.setPage(100); });
      expect(result.current.currentPage).toBe(3);
      expect(result.current.items.map((item) => item.id)).toEqual([20, 21, 22]);
      expect(result.current.canNext).toBe(false);
      return rerender({ key: 'filtrados', items: products.slice(0, 3) }).then(() => {
        expect(result.current.currentPage).toBe(1);
        expect(result.current.items.map((item) => item.id)).toEqual([0, 1, 2]);
      });
    });
  });
});
