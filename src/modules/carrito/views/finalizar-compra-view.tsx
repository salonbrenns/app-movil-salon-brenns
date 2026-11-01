import { Link, Redirect } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { ErrorState } from '@/components/feedback/async-states';
import { ResourceStatus } from '@/components/feedback/resource-status';
import { StatusMessage } from '@/components/feedback/status-message';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { DatosTransferencia } from '@/components/ui/datos-transferencia';
import { PaymentProofUploader } from '@/components/ui/payment-proof-uploader';
import { Screen } from '@/components/ui/screen';
import { InfoRow } from '@/components/ui/style-guide';
import { TextLink } from '@/components/ui/text-link';
import { useAuthSession } from '@/modules/auth/viewmodels/auth-session-provider';
import { StorePickupInfo } from '@/modules/legal/components/store-pickup-info';
import { Colors, Spacing } from '@/theme';
import { formatPrice } from '@/utils/format-price';
import type { ItemCarrito } from '../models/carrito';
import { useCarritoViewModel } from '../viewmodels/use-carrito-view-model';

type ResumenConfirmado = { items: readonly ItemCarrito[]; subtotal: string };

export default function FinalizarCompraView() {
  const { status } = useAuthSession();
  const vm = useCarritoViewModel();
  const [resumenConfirmado, setResumenConfirmado] = useState<ResumenConfirmado | null>(null);
  const pedido = vm.pedidoRegistrado;
  const items = pedido ? resumenConfirmado?.items ?? [] : vm.items;
  const subtotal = pedido ? resumenConfirmado?.subtotal : vm.resumen?.subtotal;
  const total = pedido?.total ?? subtotal;

  if (status === 'anonymous') return <Redirect href={{ pathname: '/autenticacion', params: { returnTo: '/finalizar-compra' } }} />;

  return <Screen title="Finalizar compra" backHref="/carrito">
    <ResourceStatus {...vm} empty={!pedido && vm.items.length === 0} emptyTitle="Tu carrito está vacío" />

    {(items.length > 0 || pedido) ? <View style={styles.ticket}>
      <View style={styles.section}>
        <ThemedText type="subtitle" themeColor="primary">Resumen del pedido</ThemedText>
        {pedido ? <ThemedText type="small" themeColor="primary">Pedido #{pedido.id} registrado</ThemedText> : null}
        {items.map((item) => <View key={item.id} style={styles.productRow}>
          <View style={styles.productName}>
            <ThemedText type="label">{item.titulo}</ThemedText>
            {item.variante ? <ThemedText type="small" themeColor="textSecondary">{item.variante}</ThemedText> : null}
          </View>
          <ThemedText type="small" style={styles.productAmount}>{item.cantidad} × {formatPrice(item.precio)}</ThemedText>
        </View>)}
        {subtotal ? <InfoRow label="Subtotal" value={formatPrice(subtotal)} /> : null}
        {total ? <View style={styles.totalRow}><InfoRow label="Total" value={formatPrice(total)} accent /></View> : null}
      </View>

      <View style={styles.divider} />
      <View style={styles.section}>
        <ThemedText type="subtitle" themeColor="primary">Datos del comprador</ThemedText>
        {vm.errorPerfil ? <ErrorState message={vm.errorPerfil} onRetry={vm.recargarPerfil} /> : vm.perfil ? <>
          <InfoRow label="Nombre" value={vm.perfil.nombre} />
          <InfoRow label="Correo" value={vm.perfil.correo} />
          {!pedido ? <TextLink href="/cuenta/editar-perfil" label="Editar datos" /> : null}
        </> : <ThemedText type="small" themeColor="textSecondary">Consultando tus datos…</ThemedText>}
      </View>

      <View style={styles.divider} />
      <View style={styles.section}>
        <StorePickupInfo flat />
        <TextLink href="/cuenta/compras-recogida" label="Consultar política de recogida" />
      </View>

      <View style={styles.divider} />
      <View style={styles.section}>
        <ResourceStatus {...vm.transferencia} />
        {vm.transferencia.datos && !vm.transferencia.error ? <DatosTransferencia datos={vm.transferencia.datos.banco} flat /> : null}
      </View>

      <View style={styles.divider} />
      <View style={styles.section}>
      {pedido ? <>
        <ThemedText type="subtitle" themeColor="primary">Comprobante de transferencia</ThemedText>
        <ThemedText type="small" themeColor="textSecondary">Adjunta el comprobante después de realizar la transferencia. El pedido queda pendiente de validación.</ThemedText>
        {vm.comprobanteEnviado ? <StatusMessage message="Comprobante enviado correctamente." tone="success" />
          : <PaymentProofUploader onUpload={vm.enviarComprobante} />}
      </> : <>
        {!vm.existenciasValidas ? <StatusMessage message="Revisa las cantidades y existencias antes de confirmar el pedido." /> : null}
        <ThemedText type="small" themeColor="textSecondary">Al confirmar se registrará tu pedido pendiente de pago o validación. El estado se consulta en Mis compras.</ThemedText>
        <View style={styles.legalLinks}>
          <TextLink href="/cuenta/terminos" label="Términos y condiciones" />
          <TextLink href="/cuenta/politicas" label="Políticas de cancelaciones y devoluciones" />
        </View>
        <Button label="Confirmar pedido" loading={vm.ocupado} disabled={!vm.perfil || !vm.existenciasValidas || !vm.transferencia.datos || !!vm.transferencia.error || vm.transferencia.cargando || vm.cargando || vm.ocupado} onPress={() => {
          const snapshot = { items: vm.items, subtotal: vm.resumen?.subtotal ?? '' };
          void vm.confirmarPedido(() => setResumenConfirmado(snapshot));
        }} />
      </>}
      </View>
      <View style={styles.divider} />
      <View style={styles.section}><TextLink href="/cuenta/compras" label="Ver mis compras" /></View>
    </View> : <>
      <Link href="/carrito" asChild><Button label="Volver al carrito" variant="secondary" /></Link>
      <TextLink href="/cuenta/compras" label="Ver mis compras" />
    </>}
  </Screen>;
}

const styles = StyleSheet.create({
  ticket: { backgroundColor: Colors.backgroundElement },
  divider: { height: 1, backgroundColor: Colors.primarySoft },
  section: { gap: Spacing.three, paddingVertical: Spacing.three },
  productRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: Spacing.two },
  productName: { flex: 1, minWidth: 0, gap: Spacing.one },
  productAmount: { textAlign: 'right' },
  totalRow: { paddingTop: Spacing.two, borderTopWidth: 1, borderTopColor: Colors.borderAccent },
  legalLinks: { gap: Spacing.one },
});
