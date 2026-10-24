import { CatalogCard } from '@/components/ui/style-guide';
import { PaginationControls } from '@/components/ui/pagination-controls';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Spacing } from '@/theme';
import type { Producto } from '@/modules/productos/models/producto';
import { useProductosViewModel } from '@/modules/productos/viewmodels/use-productos-view-model';
import { getProductGridLayout } from '@/modules/productos/viewmodels/product-grid';

export function ProductosListView({ productos, resetKey }: { productos: readonly Producto[]; resetKey: string }) {
  const { tarjetas, pagination } = useProductosViewModel(productos, resetKey);
  const [gridWidth, setGridWidth] = useState(0);
  const { cardWidth } = getProductGridLayout(gridWidth, Spacing.two);
  return <>
    <View style={styles.grid} onLayout={(event) => { setGridWidth(event.nativeEvent.layout.width); }}>{tarjetas.map(({ id, ...card }) => <View key={id} style={[styles.cell, { width: cardWidth ?? '100%' }]}><CatalogCard {...card} compact /></View>)}</View>
    <PaginationControls {...pagination} />
  </>;
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  cell: { minWidth: 0, flexGrow: 0 },
});
