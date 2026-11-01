import { Link, router, type Href } from 'expo-router';
import { View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { InfoRow } from '@/components/ui/style-guide';
import { Calendar } from '@/components/ui/calendar';
import { HorariosSelector } from '@/components/ui/horarios-selector';
import { ResourceStatus } from '@/components/feedback/resource-status';
import { StatusMessage } from '@/components/feedback/status-message';
import { accountSectionStyles as styles } from '@/components/ui/account-section-styles';
import { useReservaViewModel } from '../viewmodels/use-reserva-view-model';
import type { Servicio } from '@/modules/servicios/models/servicio';

export function ReservaForm({ servicio }: { servicio: Servicio }) {
  const vm = useReservaViewModel(servicio);
  if (!vm.authenticated) return <Link href={{ pathname: '/autenticacion', params: { returnTo: '/servicios?id=' + servicio.id } }} asChild><Button label="Inicia sesión para agendar" /></Link>;
  return <View style={styles.form}>
    <ThemedText type="subtitle">Agenda tu cita</ThemedText>
    <ThemedText type="label">1. Selecciona una fecha</ThemedText>
    <ResourceStatus {...vm.dias} />
    <Calendar vm={vm.calendar} selected={vm.fecha} onSelect={vm.cambiarFecha} disabled={vm.dias.cargando || !!vm.dias.error || !vm.dias.datos || vm.ocupado} />
    {vm.fecha ? <InfoRow label="Día" value={vm.fecha} /> : null}
    <ResourceStatus {...vm} empty={vm.consultado && !vm.horarios.length} emptyTitle={vm.sinAtencion ? 'No hay atención para esta fecha' : 'No hay horarios disponibles para esta fecha'} />
    {vm.conflicto ? <StatusMessage message={vm.conflicto} tone="info" /> : null}
    {vm.fecha ? <ThemedText type="label">2. Elige un horario disponible</ThemedText> : null}
    <HorariosSelector horarios={vm.horarios} selected={vm.hora} onSelect={vm.cambiarHora} disabled={vm.ocupado || vm.cargando} />
    {vm.hora ? <Button label="Continuar con la reserva" disabled={!vm.puedeContinuar} onPress={() => {
      router.push({ pathname: '/pago-servicio', params: { id: servicio.id, fecha: vm.fecha, hora: vm.hora! } } as unknown as Href);
    }} /> : null}
  </View>;
}
