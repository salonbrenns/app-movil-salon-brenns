const minimumCardWidth = 132;

export function getProductGridLayout(width: number, gap: number) {
  const columns = width >= minimumCardWidth * 2 + gap ? 2 : 1;
  const cardWidth = width > 0 ? (width - (columns - 1) * gap) / columns : undefined;
  return { columns, cardWidth };
}
