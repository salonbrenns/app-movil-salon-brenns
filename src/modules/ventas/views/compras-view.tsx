import { Link } from 'expo-router';
import { View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { InfoRow, MediaPlaceholder, SegmentedControl } from '@/components/ui/style-guide';
import { ResourceStatus } from '@/components/feedback/resource-status';
import { accountSectionStyles as styles } from '@/components/ui/account-section-styles';
import { useComprasViewModel } from '../viewmodels/use-compras-view-model';
import { formatPrice } from '@/utils/format-price';
import { useScreenBackAction } from '@/components/ui/screen';
import { StorePickupInfo } from '@/modules/legal/components/store-pickup-info';
import { Sizes, Spacing } from '@/theme';

export function ComprasView() {
  const vm = useComprasViewModel();
  useScreenBackAction(vm.detalle !== null, () => vm.setDetalle(null));
  return <View style={styles.section}>
    <SegmentedControl options={['Actuales', 'Historial']} selected={vm.seccion} onSelect={vm.setSeccion} />
    <ResourceStatus {...vm} empty={!vm.pedidos.length} emptyTitle={vm.seccion === 'Actuales' ? 'No tienes pedidos actuales' : 'No tienes pedidos en el historial'} />
    {vm.pedidos.map(pedido => <ThemedView key={pedido.id} surface="card" style={styles.section}>
      <ThemedText type="label">Pedido #{pedido.id}</ThemedText>
      <InfoRow label="Fecha" value={new Date(pedido.fecha).toLocaleDateString('es-MX')} />
      <InfoRow label="Estado" value={pedido.estado} />
      <InfoRow label="Total" value={formatPrice(pedido.total)} accent />
      <Button label={vm.detalle === pedido.id ? 'Ocultar detalle' : 'Ver detalle'} variant="secondary" onPress={() => vm.setDetalle(vm.detalle === pedido.id ? null : pedido.id)} />
      {vm.detalle === pedido.id ? <View style={styles.section}>
        <StorePickupInfo />
        {pedido.detalles.map(item => <View key={item.id} style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.two }}>
          <View style={{ width: Sizes.mediaThumbnail }}><MediaPlaceholder compact source={item.imagen} label={item.nombre} product /></View>
          <View style={{ flex: 1 }}><ThemedText type="smallBold">{item.nombre} × {item.cantidad}</ThemedText>{item.variante ? <ThemedText type="small" themeColor="textSecondary">{item.variante}</ThemedText> : null}<ThemedText type="small">{formatPrice(item.subtotal)}</ThemedText></View>
        </View>)}
        <ThemedText type="small" themeColor="textSecondary">{pedido.comprobanteRecibido ? 'Comprobante enviado correctamente.' : 'Comprobante pendiente de envío.'}</ThemedText>
        {!pedido.comprobanteRecibido && pedido.estado === 'PENDIENTE' ? <Link href={{ pathname: '/pago', params: { tipo: 'pedido', id: pedido.id } }} asChild><Button label="Continuar al pago" /></Link> : null}
      </View> : null}
    </ThemedView>)}
  </View>;
}
