import { Link } from 'expo-router';
import { View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { CustomButton as Button } from '@/components/ui/button';
import { ChoiceChips, InfoRow } from '@/components/ui/style-guide';
import { Calendar } from '@/components/ui/calendar';
import { HorariosSelector } from '@/components/ui/horarios-selector';
import { DatosTransferencia } from '@/components/ui/datos-transferencia';
import { ResourceStatus } from '@/components/feedback/resource-status';
import { accountSectionStyles as styles } from '@/components/ui/account-section-styles';
import { useReservaViewModel } from '../viewmodels/use-reserva-view-model';
import type { Servicio } from '@/modules/servicios/models/servicio';
import { formatPrice } from '@/utils/format-price';
import { StatusMessage } from '@/components/feedback/status-message';
import { PaymentProofUploader } from '@/components/ui/payment-proof-uploader';
export function ReservaForm({ servicio }: { servicio: Servicio }) {
  const vm = useReservaViewModel(servicio);
  if (!vm.authenticated) return <Link href={{ pathname: '/autenticacion', params: { returnTo: '/servicios?id=' + servicio.id } }} asChild><Button label="Inicia sesión para agendar" /></Link>;
  return <View style={styles.form}>
    <ThemedText type="subtitle">Agenda tu cita</ThemedText>
    <ThemedView surface="card"><InfoRow label="Servicio" value={servicio.nombre} /><InfoRow label="Precio" value={formatPrice(servicio.precio)} /></ThemedView>
    <ThemedText type="label">1. Selecciona una fecha</ThemedText>
    <ResourceStatus {...vm.dias} />
    <Calendar vm={vm.calendar} selected={vm.fecha} onSelect={vm.cambiarFecha} disabled={vm.dias.cargando || !!vm.dias.error || !vm.dias.datos || vm.ocupado || !!vm.cita} />
    {vm.fecha ? <InfoRow label="Día" value={vm.fecha} /> : null}
    <ResourceStatus {...vm} empty={vm.consultado && !vm.horarios.length && !vm.cita} emptyTitle={vm.sinAtencion ? 'No hay atención para esta fecha' : 'No hay horarios disponibles para esta fecha'} />
    {vm.cita && !vm.mensaje ? <StatusMessage message={vm.comprobanteEnviado ? 'Comprobante recibido. Consulta el estado de la cita en Agenda.' : 'Cita #' + vm.cita.id + ' registrada. El pago por transferencia está pendiente.'} tone="info" /> : null}
    {vm.cita && !vm.comprobanteEnviado ? <PaymentProofUploader onUpload={vm.enviarComprobante} /> : null}
    {vm.conflicto ? <StatusMessage message={vm.conflicto} tone="info" /> : null}
    {!vm.cita && vm.fecha ? <ThemedText type="label">2. Elige un horario disponible</ThemedText> : null}
    {!vm.cita ? <HorariosSelector horarios={vm.horarios} selected={vm.hora} onSelect={vm.cambiarHora} disabled={vm.ocupado || vm.cargando} /> : null}
    <ResourceStatus {...vm.transferencia} />
    {vm.transferencia.datos && !vm.transferencia.error ? <>
      <ThemedText type="label">Importe a transferir</ThemedText>
      <ChoiceChips options={[{ value: 'ANTICIPO', label: 'Anticipo ' + vm.transferencia.datos.anticipoPorcentaje + '%' }, { value: 'COMPLETO', label: 'Pago completo' }]} selected={vm.tipoPago} onSelect={vm.cambiarTipoPago} disabled={vm.ocupado || !!vm.cita} />
      {vm.hora ? <ThemedView surface="card" style={styles.section}><ThemedText type="subtitle">3. Confirma tu cita</ThemedText><InfoRow label="Servicio" value={servicio.nombre} /><InfoRow label="Día" value={vm.fecha} /><InfoRow label="Hora" value={vm.hora} /><InfoRow label="Precio del servicio" value={formatPrice(servicio.precio)} /><InfoRow label={vm.tipoPago === 'ANTICIPO' ? 'Anticipo a transferir' : 'Importe completo'} value={formatPrice(vm.importe)} accent /><InfoRow label="Método" value="Transferencia bancaria" /></ThemedView> : null}
      <DatosTransferencia datos={vm.transferencia.datos.banco} />
    </> : null}
    <ThemedText type="small" themeColor="textSecondary">La cita se registra como pendiente. El pago debe acreditarse antes de su confirmación.</ThemedText>
    <Button label={vm.cita ? 'Cita registrada' : 'Confirmar cita'} loading={vm.ocupado} disabled={!vm.puedeReservar} onPress={() => { void vm.reservar(); }} />
    <Link href="/agenda" asChild><Button label="Ver mi agenda" variant="secondary" /></Link>
  </View>;
}
