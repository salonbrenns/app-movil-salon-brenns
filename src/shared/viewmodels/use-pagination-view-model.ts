import { useState } from 'react';

export function usePaginationViewModel<T>(allItems: readonly T[], resetKey: string, pageSize = 10) {
  const [selection, setSelection] = useState({ key: resetKey, page: 1 });
  const size = Number.isSafeInteger(pageSize) && pageSize > 0 ? pageSize : 10;
  const totalPages = Math.max(1, Math.ceil(allItems.length / size));
  const requestedPage = selection.key === resetKey ? selection.page : 1;
  const currentPage = Math.min(Math.max(1, requestedPage), totalPages);
  const setPage = (page: number) => {
    if (Number.isSafeInteger(page)) setSelection({ key: resetKey, page: Math.min(Math.max(1, page), totalPages) });
  };
  return {
    items: allItems.slice((currentPage - 1) * size, currentPage * size),
    currentPage, totalPages,
    canPrevious: currentPage > 1, canNext: currentPage < totalPages,
    previous: () => setPage(currentPage - 1), next: () => setPage(currentPage + 1), setPage,
  };
}
