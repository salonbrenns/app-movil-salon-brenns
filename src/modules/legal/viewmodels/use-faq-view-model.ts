import { useState } from 'react';

export function useFaqViewModel() {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  return {
    expandedIndex,
    toggle: (index: number) => setExpandedIndex((current) => current === index ? null : index),
  };
}
