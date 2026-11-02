import { act, renderHook } from '@testing-library/react-native';
import { usePaginationViewModel } from '@/shared/viewmodels/use-pagination-view-model';

test.each([
  ['Servicios', 10], ['Cursos', 10], ['Productos', 10],
  ['Compras actuales', 5], ['Historial de compras', 5],
  ['Mis cursos', 2], ['Próximas citas', 4], ['Historial de citas', 4],
] as const)('%s respeta el máximo de %i por página y sus límites', async (_section, size) => {
  const records = Array.from({ length: size * 2 + 1 }, (_, id) => id);
  const { result } = await renderHook(() => usePaginationViewModel(records, 'all', size));
  expect(result.current.currentPage).toBe(1);
  expect(result.current.totalPages).toBe(3);
  expect(result.current.items).toHaveLength(size);
  expect(result.current.canPrevious).toBe(false);
  await act(() => {
    result.current.previous();
  });
  expect(result.current.currentPage).toBe(1);
  await act(() => {
    result.current.next();
  });
  expect(result.current.items).toEqual(records.slice(size, size * 2));
  await act(() => {
    result.current.next();
  });
  expect(result.current.items).toHaveLength(1);
  expect(result.current.canNext).toBe(false);
  await act(() => {
    result.current.next();
  });
  expect(result.current.currentPage).toBe(3);
});

test('listas independientes conservan sus páginas y un cambio de filtro vuelve a la primera', async () => {
  const records = Array.from({ length: 12 }, (_, id) => id);
  const { result, rerender } = await renderHook(({ filter }: { filter: string }) => ({
    actuales: usePaginationViewModel(records, filter, 5),
    historial: usePaginationViewModel(records, 'history', 5),
  }), { initialProps: { filter: 'all' } });
  await act(() => {
    result.current.actuales.next();
  });
  expect(result.current.actuales.currentPage).toBe(2);
  expect(result.current.historial.currentPage).toBe(1);
  await act(() => {
    result.current.historial.next();
  });
  await rerender({ filter: 'filtered' });
  expect(result.current.actuales.currentPage).toBe(1);
  expect(result.current.historial.currentPage).toBe(2);
});
