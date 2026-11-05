import { Link, router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { DatosTransferencia } from '@/components/ui/datos-transferencia';
import { InfoRow } from '@/components/ui/style-guide';
import { ResourceStatus } from '@/components/feedback/resource-status';
import { useInscripcionViewModel } from '../viewmodels/use-inscripcion-view-model';
import type { Curso } from '../models/curso';
import { formatPrice } from '@/utils/format-price';
import { StatusMessage } from '@/components/feedback/status-message';
import { TextLink } from '@/components/ui/text-link';
import { useAuthSession } from '@/modules/auth/viewmodels/auth-session-provider';
import { LoadingState } from '@/components/feedback/async-states';
import { Colors, Spacing } from '@/theme';

export function InscripcionForm({ curso, onPayment }: { curso: Curso; onPayment?: (pagoId: string) => void }) {
  const vm = useInscripcionViewModel(curso);
  const pagoId = vm.pagoId;
  const { status } = useAuthSession();
  const [confirming, setConfirming] = useState(false);
  const continuePayment = (pagoId: string) => { if (onPayment) onPayment(pagoId); else router.push({ pathname: '/pago', params: { tipo: 'curso', id: pagoId } }); };
  if (status === 'loading') return <LoadingState label="Comprobando sesión…" />;
  if (!vm.authenticated) return <Link href={{ pathname: '/autenticacion', params: { returnTo: '/pago-curso?id=' + curso.id } }} asChild><Button label="Inicia sesión para inscribirte" /></Link>;
  return <View style={styles.ticket}>
    <View style={styles.section}>
      <ResourceStatus {...vm} />
      <ThemedText type="subtitle">Resumen de inscripción</ThemedText>
      <InfoRow label="Curso" value={curso.nombre} />
      <InfoRow label="Importe completo" value={formatPrice(vm.inscripcion?.monto ?? curso.precio)} accent />
      <InfoRow label="Método" value="Transferencia bancaria" />
    </View>
    <View style={styles.divider} />
    <View style={styles.section}>
      <ResourceStatus {...vm.transferencia} />
      {vm.transferencia.datos && !vm.transferencia.error ? <DatosTransferencia datos={vm.transferencia.datos.banco} flat /> : null}
    </View>
    <View style={styles.divider} />
    <View style={styles.section}>
      <ThemedText type="subtitle">Confirmación y comprobante</ThemedText>
      {vm.permitido ? <ThemedText type="small" themeColor="textSecondary">Podrás adjuntar el comprobante después de registrar la inscripción.</ThemedText> : <ThemedText type="small">Las inscripciones están disponibles para cuentas de cliente.</ThemedText>}
      {vm.inscrito && vm.proofReceived ? <StatusMessage message="Comprobante enviado correctamente. Consulta el estado de revisión en Mis cursos." tone="info" /> : null}
      {vm.inscrito && pagoId && !vm.proofReceived ? <Button label="Continuar al pago" onPress={() => {
        continuePayment(pagoId);
      }} /> : null}
      {vm.inscrito && !vm.pagoId ? <StatusMessage message="Ya existe una inscripción para este curso. Consulta su estado en Mis cursos." tone="info" /> : null}
      {vm.sinCupo ? <ThemedText type="small">El cupo del curso está completo.</ThemedText> : null}
      {!vm.inscrito && vm.finalizado ? <StatusMessage message="Este curso ya terminó. Consulta los próximos cursos disponibles." tone="info" /> : null}
      <ThemedText type="small" themeColor="textSecondary">Las condiciones particulares de cancelación de este curso aún no están disponibles en la app. Solicita esa información al establecimiento antes de inscribirte.</ThemedText>
      <TextLink href="/cuenta/politicas" label="Consultar políticas de cancelación" />
      {!vm.inscrito && !confirming ? <Button label="Inscribirme" disabled={!vm.puedeInscribir} onPress={() => { setConfirming(true); }} /> : null}
      {!vm.inscrito && confirming ? <>
        <StatusMessage message={`Confirma la inscripción a ${curso.nombre} por ${formatPrice(curso.precio)}. El pago será completo por transferencia.`} tone="info" />
        <Button label="Confirmar inscripción" disabled={!vm.puedeInscribir} loading={vm.ocupado} onPress={() => { void vm.inscribir(continuePayment); }} />
        <Button label="Volver" variant="secondary" disabled={vm.ocupado} onPress={() => { setConfirming(false); }} />
      </> : null}
      <TextLink href="/cuenta/cursos" label="Ver mis cursos" />
    </View>
  </View>;
}

const styles = StyleSheet.create({ ticket: { backgroundColor: Colors.backgroundElement }, section: { gap: Spacing.three, paddingVertical: Spacing.three }, divider: { height: 1, backgroundColor: Colors.primarySoft } });
