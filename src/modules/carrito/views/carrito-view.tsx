import { Link } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { ResourceStatus } from '@/components/feedback/resource-status';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Screen } from '@/components/ui/screen';
import { MediaPlaceholder } from '@/components/ui/style-guide';
import { Touchable } from '@/components/ui/touchable';
import { Colors, Sizes, Spacing, Typography } from '@/theme';
import { formatPrice } from '@/utils/format-price';
import { useCarritoViewModel } from '../viewmodels/use-carrito-view-model';

export default function CarritoView() {
  const vm = useCarritoViewModel();

  return <Screen title="Mi carrito" backHref="/">
    <ResourceStatus {...vm} empty={vm.items.length === 0} emptyTitle="Tu carrito está vacío" />

    {vm.items.length === 0 && !vm.cargando && !vm.error ? <Link href="/cuenta/compras" asChild><Button label="Mis compras" accessibilityLabel="Mis compras" /></Link> : null}
    {vm.items.length > 0 ? <View style={styles.actionsRow}>
      <Touchable accessibilityRole="button" accessibilityLabel="Vaciar carrito" disabled={vm.ocupado} onPress={() => { void vm.vaciar(); }} style={styles.clearAction}>
        <ThemedText type="small" themeColor="textSecondary">Vaciar carrito</ThemedText>
      </Touchable>
    </View> : null}

    <View style={styles.list}>
      {vm.items.map((item, index) => <View key={item.id} style={[styles.item, index < vm.items.length - 1 && styles.itemDivider]}>
        <View style={styles.thumbnail}>
          <MediaPlaceholder compact source={item.imagen} label={item.titulo} product />
        </View>
        <View style={styles.details}>
          <ThemedText type="label" numberOfLines={2} style={styles.name}>{item.titulo}</ThemedText>
          {item.variante ? <ThemedText type="small" themeColor="textSecondary" numberOfLines={2}>{item.variante}</ThemedText> : null}
          <ThemedText type="label" themeColor="primary">{formatPrice(item.precio)}</ThemedText>
          <View style={styles.quantityControl}>
            <Touchable accessibilityRole="button" accessibilityLabel={`Reducir cantidad de ${item.titulo}`} disabled={vm.ocupado || item.cantidad <= 0} onPress={() => { void vm.cambiarCantidad(item.id, item.cantidad - 1); }} style={styles.quantityAction}>
              <ThemedText style={styles.quantitySymbol}>−</ThemedText>
            </Touchable>
            <ThemedText type="label" style={styles.quantity} accessibilityLabel={`Cantidad: ${item.cantidad}`}>{item.cantidad}</ThemedText>
            <Touchable accessibilityRole="button" accessibilityLabel={`Aumentar cantidad de ${item.titulo}`} disabled={vm.ocupado || item.cantidad >= item.stock} onPress={() => { void vm.cambiarCantidad(item.id, item.cantidad + 1); }} style={styles.quantityAction}>
              <ThemedText style={styles.quantitySymbol}>+</ThemedText>
            </Touchable>
          </View>
        </View>
        <Touchable accessibilityRole="button" accessibilityLabel={`Eliminar ${item.titulo}`} disabled={vm.ocupado} onPress={() => { void vm.eliminar(item.id); }} style={styles.removeAction}>
          <Icon name="close" color={Colors.textSecondary} size={18} />
        </Touchable>
      </View>)}
    </View>

    {vm.resumen && vm.items.length > 0 ? <View style={styles.summary}>
      <View style={styles.subtotalRow}>
        <ThemedText type="label">Subtotal</ThemedText>
        <ThemedText type="subtitle" themeColor="primary">{formatPrice(vm.resumen.subtotal)}</ThemedText>
      </View>
      <Link href="/finalizar-compra" asChild><Button label="Continuar compra" style={styles.checkoutButton} disabled={vm.ocupado || vm.cargando} /></Link>
    </View> : null}
  </Screen>;
}

const styles = StyleSheet.create({
  actionsRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: Spacing.two },
  list: { backgroundColor: Colors.background },
  item: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.two, paddingVertical: Spacing.three },
  itemDivider: { borderBottomWidth: 1, borderBottomColor: Colors.primarySoft },
  thumbnail: { width: Sizes.mediaThumbnail, flexShrink: 0 },
  details: { flex: 1, minWidth: 0, gap: Spacing.one },
  name: { paddingRight: 28 },
  quantityControl: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', borderWidth: 1, borderColor: Colors.borderAccent, borderRadius: 12, backgroundColor: Colors.background, overflow: 'hidden' },
  quantityAction: { width: Sizes.touchMinWidth, minWidth: Sizes.touchMinWidth, minHeight: Sizes.touchMinWidth, alignItems: 'center', justifyContent: 'center' },
  quantitySymbol: { ...Typography.action, color: Colors.primary, fontSize: 19 },
  quantity: { minWidth: 28, textAlign: 'center' },
  removeAction: { position: 'absolute', top: Spacing.two, right: Spacing.two, width: Sizes.touchMinWidth, minWidth: Sizes.touchMinWidth, alignItems: 'center', justifyContent: 'center' },
  summary: { gap: Spacing.three, borderTopWidth: 1, borderTopColor: Colors.primarySoft, paddingTop: Spacing.three },
  subtotalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: Spacing.two },
  checkoutButton: { minHeight: 52 },
  clearAction: { justifyContent: 'center', minHeight: Sizes.touchMinWidth },
});
