import { Link, Redirect, useLocalSearchParams } from 'expo-router';
import { View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { DatosTransferencia } from '@/components/ui/datos-transferencia';
import { PaymentProofUploader } from '@/components/ui/payment-proof-uploader';
import { Screen } from '@/components/ui/screen';
import { InfoRow } from '@/components/ui/style-guide';
import { ResourceStatus } from '@/components/feedback/resource-status';
import { StatusMessage } from '@/components/feedback/status-message';
import { accountSectionStyles as styles } from '@/components/ui/account-section-styles';
import { useAuthSession } from '@/modules/auth/viewmodels/auth-session-provider';
import { formatPrice } from '@/utils/format-price';
import { paymentKind } from '../models/pago';
import { usePaymentViewModel } from '../viewmodels/use-payment-view-model';

const returnPaths = { cita: '/agenda', curso: '/cuenta/cursos', pedido: '/cuenta/compras' } as const;
const returnLabels = { cita: 'Volver a Mis citas', curso: 'Volver a Mis cursos', pedido: 'Volver a Mis compras' } as const;

export default function PaymentView() {
  const params = useLocalSearchParams<{ tipo?: string; id?: string }>();
  const kind = paymentKind(params.tipo);
  const id = typeof params.id === 'string' ? params.id : '';
  const { status } = useAuthSession();
  const vm = usePaymentViewModel(kind, id);
  const backHref = kind ? returnPaths[kind] : '/';
  if (status === 'anonymous') return <Redirect href={{ pathname: '/autenticacion', params: { returnTo: `/pago?tipo=${kind ?? ''}&id=${encodeURIComponent(id)}` } }} />;
  const operation = vm.payment.datos;
  return <Screen title="Pago por transferencia" backHref={backHref}>
    <ResourceStatus {...vm.payment} />
    {operation ? <ThemedView surface="card" style={styles.section}>
      <ThemedText type="subtitle">Resumen</ThemedText>
      <InfoRow label={kind === 'cita' ? 'Servicio' : kind === 'curso' ? 'Curso' : 'Pedido'} value={operation.title} />
      {operation.detail ? <ThemedText type="small" themeColor="textSecondary">{operation.detail}</ThemedText> : null}
      <InfoRow label="Estado" value={operation.status} />
      {operation.amount ? <InfoRow label="Monto exacto a transferir" value={formatPrice(operation.amount)} accent /> : <StatusMessage message="No se informó el importe de esta operación. Consulta al establecimiento antes de transferir." />}
    </ThemedView> : null}
    <ResourceStatus {...vm.bank} />
    {operation && vm.bank.datos && !vm.bank.error ? <DatosTransferencia datos={vm.bank.datos.banco} /> : null}
    {operation && !vm.bank.cargando && !vm.bank.datos && !vm.bank.error ? <StatusMessage message="No hay datos bancarios disponibles para continuar con el pago." /> : null}
    {operation ? <View style={styles.section}>
      <ThemedText type="subtitle">Cómo realizar la transferencia</ThemedText>
      <ThemedText type="small" themeColor="textSecondary">{vm.bank.datos && !vm.bank.error
        ? 'Transfiere el monto indicado a la cuenta mostrada. Conserva el comprobante y adjúntalo aquí.'
        : 'Si ya realizaste la transferencia, puedes adjuntar su comprobante. Solicita los datos bancarios al establecimiento antes de hacer un nuevo pago.'}</ThemedText>
      {vm.proofReceived ? <StatusMessage tone="success" message="Comprobante enviado correctamente." /> : null}
      {!vm.proofReceived && vm.canUpload ? <PaymentProofUploader onUpload={vm.upload} /> : null}
      {!vm.proofReceived && !operation.canUpload ? <StatusMessage message="Esta operación no permite subir otro comprobante. Consulta su estado en tu cuenta." tone="info" /> : null}
    </View> : null}
    {kind ? <Link href={returnPaths[kind]} asChild><Button label={returnLabels[kind]} variant="secondary" /></Link> : null}
  </Screen>;
}
