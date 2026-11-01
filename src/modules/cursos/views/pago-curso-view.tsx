import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { ErrorState, LoadingState } from '@/components/feedback/async-states';
import { StatusMessage } from '@/components/feedback/status-message';
import { Screen } from '@/components/ui/screen';
import { useAuthSession } from '@/modules/auth/viewmodels/auth-session-provider';
import { PaymentTicket } from '@/modules/pagos/views/payment-view';
import { useCursosViewModel } from '../viewmodels/use-cursos-view-model';
import { InscripcionForm } from './inscripcion-form';

export default function PagoCursoView() {
  const { id, pagoId } = useLocalSearchParams<{ id?: string; pagoId?: string }>();
  const { status } = useAuthSession();
  const { curso, cargando, error, recargar } = useCursosViewModel(pagoId ? undefined : id);
  const backHref = { pathname: '/cursos' as const, params: { id: id ?? '' } };
  if (status === 'anonymous') return <Redirect href={{ pathname: '/autenticacion', params: { returnTo: `/pago-curso?id=${encodeURIComponent(id ?? '')}` } }} />;
  if (status === 'loading') return <Screen title="Pago por transferencia" backHref={backHref}><LoadingState label="Comprobando sesión…" /></Screen>;
  return <Screen title="Pago por transferencia" backHref={backHref}>
    {pagoId ? <PaymentTicket kind="curso" id={pagoId} /> : !id ? <StatusMessage message="Selecciona un curso desde el catálogo." /> : cargando ? <LoadingState label="Cargando curso…" /> : error ? <ErrorState message={error} onRetry={recargar} /> : curso ? <InscripcionForm curso={curso} onPayment={(nextId) => router.setParams({ pagoId: nextId })} /> : null}
  </Screen>;
}
