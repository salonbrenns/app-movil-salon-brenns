import { Link, Redirect, router, useLocalSearchParams } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { ResourceStatus } from '@/components/feedback/resource-status';
import { ErrorState, LoadingState } from '@/components/feedback/async-states';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { DatosTransferencia } from '@/components/ui/datos-transferencia';
import { Screen } from '@/components/ui/screen';
import { ChoiceChips, InfoRow } from '@/components/ui/style-guide';
import { StatusMessage } from '@/components/feedback/status-message';
import { TextLink } from '@/components/ui/text-link';
import { useAuthSession } from '@/modules/auth/viewmodels/auth-session-provider';
import { useServiciosViewModel } from '@/modules/servicios/viewmodels/use-servicios-view-model';
import type { Servicio } from '@/modules/servicios/models/servicio';
import { PaymentTicket } from '@/modules/pagos/views/payment-view';
import { Colors, Spacing } from '@/theme';
import { formatPrice } from '@/utils/format-price';
import { useReservaViewModel } from '../viewmodels/use-reserva-view-model';

function ReservaPaymentTicket({ servicio, fecha, hora }: { servicio: Servicio; fecha: string; hora: string }) {
  const vm = useReservaViewModel(servicio, undefined, { fecha, hora });
  return <View style={styles.ticket}>
    <View style={styles.section}>
      <ThemedText type="subtitle">Datos de la reserva</ThemedText>
      <InfoRow label="Servicio" value={servicio.nombre} />
      <InfoRow label="Fecha" value={fecha} />
      <InfoRow label="Hora" value={hora} />
      <InfoRow label="Precio del servicio" value={formatPrice(servicio.precio)} />
      <ResourceStatus {...vm.dias} />
      <ResourceStatus {...vm} />
      {vm.conflicto || !vm.hora && !vm.cargando ? <StatusMessage message={vm.conflicto ?? 'El horario ya no está disponible. Elige otro en el detalle del servicio.'} tone="info" /> : null}
    </View>
    <View style={styles.divider} />
    <View style={styles.section}>
      <ThemedText type="subtitle">Importe a transferir</ThemedText>
      <ResourceStatus {...vm.transferencia} />
      {vm.transferencia.datos && !vm.transferencia.error ? <>
        {vm.transferencia.datos.anticipoPorcentaje < 100 ? <ChoiceChips options={[{ value: 'ANTICIPO', label: 'Anticipo ' + vm.transferencia.datos.anticipoPorcentaje + '%' }, { value: 'COMPLETO', label: 'Pago completo' }]} selected={vm.tipoPago} onSelect={vm.cambiarTipoPago} disabled={vm.ocupado} /> : null}
        <InfoRow label={vm.tipoPago === 'ANTICIPO' ? 'Anticipo a transferir' : 'Pago completo'} value={formatPrice(vm.importe)} accent />
      </> : null}
    </View>
    <View style={styles.divider} />
    <View style={styles.section}>
      {vm.transferencia.datos && !vm.transferencia.error ? <DatosTransferencia datos={vm.transferencia.datos.banco} flat /> : null}
    </View>
    <View style={styles.divider} />
    <View style={styles.section}>
      <ThemedText type="subtitle">Confirmación y comprobante</ThemedText>
      <ThemedText type="small" themeColor="textSecondary">La cita se registrará como pendiente. Después podrás adjuntar el comprobante para su revisión.</ThemedText>
      <ThemedText type="small" themeColor="textSecondary">Solicita la cancelación con al menos 24 horas de anticipación. Fuera del plazo o por inasistencia, el anticipo puede no ser reembolsable, sin perjuicio de tus derechos legales.</ThemedText>
      <TextLink href="/cuenta/politicas" label="Consultar política de cancelaciones" />
      <Button label="Confirmar cita" loading={vm.ocupado} disabled={!vm.puedeReservar} onPress={() => { void vm.reservar((id) => router.setParams({ citaId: id })); }} />
      <Link href={{ pathname: '/servicios', params: { id: servicio.id } }} asChild><Button label="Cambiar fecha u hora" variant="secondary" /></Link>
    </View>
  </View>;
}

export default function PagoServicioView() {
  const { id, fecha, hora, citaId } = useLocalSearchParams<{ id?: string; fecha?: string; hora?: string; citaId?: string }>();
  const { status } = useAuthSession();
  const { servicio, cargando, error, recargar } = useServiciosViewModel(citaId ? undefined : id);
  const backHref = { pathname: '/servicios' as const, params: { id: id ?? '' } };
  if (status === 'anonymous') return <Redirect href={{ pathname: '/autenticacion', params: { returnTo: `/pago-servicio?id=${encodeURIComponent(id ?? '')}&fecha=${encodeURIComponent(fecha ?? '')}&hora=${encodeURIComponent(hora ?? '')}` } }} />;
  if (status === 'loading') return <Screen title="Pago por transferencia" backHref={backHref}><LoadingState label="Comprobando sesión…" /></Screen>;
  return <Screen title="Pago por transferencia" backHref={backHref}>
    {citaId ? <PaymentTicket kind="cita" id={citaId} /> : !id || !fecha || !hora ? <StatusMessage message="Selecciona una fecha y un horario desde el detalle del servicio." /> : cargando ? <LoadingState label="Cargando servicio…" /> : error ? <ErrorState message={error} onRetry={recargar} /> : servicio ? <ReservaPaymentTicket servicio={servicio} fecha={fecha} hora={hora} /> : null}
  </Screen>;
}

const styles = StyleSheet.create({ ticket: { backgroundColor: Colors.backgroundElement }, section: { gap: Spacing.three, paddingVertical: Spacing.three }, divider: { height: 1, backgroundColor: Colors.primarySoft } });
