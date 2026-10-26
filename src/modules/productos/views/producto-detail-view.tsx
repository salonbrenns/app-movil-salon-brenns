import { Link, useLocalSearchParams } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { Screen } from '@/components/ui/screen';
import { ChoiceChips, InfoRow, MediaPlaceholder } from '@/components/ui/style-guide';
import { EmptyState, ErrorState, LoadingState } from '@/components/feedback/async-states';
import { ThemedText } from '@/components/themed-text';
import { formatPrice } from '@/utils/format-price';
import { useProductoViewModel } from '../viewmodels/use-producto-view-model';
import { Button } from '@/components/ui/button';
import { ResourceStatus } from '@/components/feedback/resource-status';
import { useCarritoProductoViewModel } from '../viewmodels/use-carrito-producto-view-model';
import { useFavoriteAction } from '@/modules/favoritos/viewmodels/use-favorite-action';
import { FavoriteButton } from '@/components/ui/favorite-button';
import { Spacing } from '@/theme';

export default function ProductoDetailView() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { producto, selected, variantId, seleccionarVariante, cargando, error, recargar } = useProductoViewModel(id);
  const cart = useCarritoProductoViewModel(selected);
  const favorite = useFavoriteAction('Productos', id);
  return <Screen title="Producto" backHref="/catalogo">
    {cargando ? <LoadingState label="Cargando producto…" /> : null}
    {!cargando && error ? <ErrorState message={error} onRetry={recargar} /> : null}
    {!cargando && !error && !producto ? <EmptyState title="Producto no disponible" description="Vuelve al catálogo para explorar los productos." /> : null}
    {producto ? <>
      <MediaPlaceholder label={producto.nombre} source={selected?.imagen ?? producto.imagen} detail />
      <View style={styles.heading}>
        <ThemedText type="title" accessibilityRole="header" style={styles.title}>{producto.nombre}</ThemedText>
        <FavoriteButton title={producto.nombre} selected={favorite.selected} disabled={favorite.authenticated && (favorite.cargando || !!favorite.error)} busy={favorite.ocupado} onPress={favorite.toggle} />
      </View>
      <ResourceStatus {...favorite} cargando={false} />
      <InfoRow label="Precio" value={selected ? formatPrice(selected.precio) : producto.precio == null ? 'Precio no disponible' : formatPrice(producto.precio)} accent />
      {producto.descripcion ? <ThemedText themeColor="textSecondary">{producto.descripcion}</ThemedText> : null}
      {producto.marca ? <InfoRow label="Marca" value={producto.marca} /> : null}
      {producto.categoria ? <InfoRow label="Categoría" value={producto.categoria} /> : null}
      {producto.variantes.length > 0 ? <>
        <ThemedText type="subtitle" accessibilityRole="header">Variantes</ThemedText>
        <ChoiceChips options={producto.variantes.map((v) => ({ value: v.id, label: [v.presentacion, v.tono].filter(Boolean).join(' · ') || `Variante ${v.id}` }))} selected={variantId} onSelect={seleccionarVariante} />
        {selected ? <View style={styles.variantSummary}>
          <InfoRow label="Existencia" value={selected.stock > 0 ? `${selected.stock} disponibles` : 'Agotado'} />
          <ResourceStatus {...cart} />
          <View style={styles.purchaseActions}>
            {cart.authenticated ? <Button label="Agregar al carrito" loading={cart.ocupado} disabled={cart.ocupado || selected.stock <= 0} onPress={() => { void cart.agregar(); }} /> : <Link href={{ pathname: '/autenticacion', params: { returnTo: '/productos/' + id } }} asChild><Button label="Inicia sesión para agregar al carrito" /></Link>}
            <Link href="/carrito" push asChild><Button label="Ver carrito" variant="secondary" /></Link>
          </View>
        </View> : null}
      </> : null}
    </> : null}
  </Screen>;
}

const styles = StyleSheet.create({
  heading: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.two },
  title: { flex: 1, minWidth: 0 },
  variantSummary: { gap: Spacing.three },
  purchaseActions: { gap: Spacing.three, paddingTop: Spacing.two },
});
