import { Link, router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { CustomButton as Button } from '@/components/ui/button';
import { InfoRow } from '@/components/ui/style-guide';
import { accountSectionStyles as styles } from '@/components/ui/account-section-styles';
import { ResourceStatus } from '@/components/feedback/resource-status';
import { useInscripcionViewModel } from '../viewmodels/use-inscripcion-view-model';
import type { Curso } from '../models/curso';
import { formatPrice } from '@/utils/format-price';
import { StatusMessage } from '@/components/feedback/status-message';
import { TextLink } from '@/components/ui/text-link';
import { useAuthSession } from '@/modules/auth/viewmodels/auth-session-provider';
import { LoadingState } from '@/components/feedback/async-states';
export function InscripcionForm({ curso }: { curso: Curso }) {
  const vm = useInscripcionViewModel(curso);
  const { status } = useAuthSession();
  const [confirming, setConfirming] = useState(false);
  if (status === 'loading') return <LoadingState label="Comprobando sesión…" />;
  if (!vm.authenticated) return <Link href={{ pathname: '/autenticacion', params: { returnTo: '/cursos?id=' + curso.id } }} asChild><Button label="Inicia sesión para inscribirte" /></Link>;
  return <View style={styles.form}><ResourceStatus {...vm} /><ResourceStatus {...vm.transferencia} />
    <ThemedText type="subtitle">Resumen de inscripción</ThemedText>
    <InfoRow label="Curso" value={curso.nombre} /><InfoRow label="Importe completo" value={formatPrice(vm.inscripcion?.monto ?? curso.precio)} accent /><InfoRow label="Método" value="Transferencia bancaria" />
    {vm.permitido ? <ThemedText type="small" themeColor="textSecondary">Podrás adjuntar el comprobante después de inscribirte.</ThemedText> : <ThemedText type="small">Las inscripciones están disponibles para cuentas de cliente.</ThemedText>}
    {vm.inscrito && vm.proofReceived ? <StatusMessage message="Comprobante enviado correctamente." tone="info" /> : null}
    {vm.inscrito && vm.pagoId && !vm.proofReceived ? <Link href={{ pathname: '/pago', params: { tipo: 'curso', id: vm.pagoId } }} asChild><Button label="Continuar al pago" /></Link> : null}
    {vm.sinCupo ? <ThemedText type="small">El cupo del curso está completo.</ThemedText> : null}
    {!vm.inscrito && vm.finalizado ? <StatusMessage message="Este curso ya terminó. Consulta los próximos cursos disponibles." tone="info" /> : null}
    <ThemedText type="small" themeColor="textSecondary">Las condiciones particulares de cancelación de este curso aún no están disponibles en la app. Solicita esa información al establecimiento antes de inscribirte.</ThemedText>
    <TextLink href="/cuenta/politicas" label="Consultar políticas de cancelación" />
    {!vm.inscrito && !confirming ? <Button label="Inscribirme" disabled={!vm.puedeInscribir} onPress={() => { setConfirming(true); }} /> : null}
    {!vm.inscrito && confirming ? <>
      <StatusMessage message={`Confirma la inscripción a ${curso.nombre} por ${formatPrice(curso.precio)}. El pago será completo por transferencia.`} tone="info" />
      <Button label="Confirmar inscripción" disabled={!vm.puedeInscribir} loading={vm.ocupado} onPress={() => { void vm.inscribir((pagoId) => router.push({ pathname: '/pago', params: { tipo: 'curso', id: pagoId } })); }} />
      <Button label="Volver" variant="secondary" disabled={vm.ocupado} onPress={() => { setConfirming(false); }} />
    </> : null}
    <TextLink href="/cuenta/cursos" label="Ver mis cursos" />
  </View>;
}
