import { Redirect, useLocalSearchParams } from 'expo-router';

import { LoadingState } from '@/components/feedback/async-states';
import { Screen } from '@/components/ui/screen';
import { AutenticacionSeccionView } from '@/modules/auth/views/autenticacion-seccion-view';
import type { DestinoCuenta } from '@/modules/cuenta/viewmodels/cuenta-state';
import { useCuentaViewModel } from '@/modules/cuenta/viewmodels/use-cuenta-view-model';
import { loginDestination } from '@/modules/auth/models/auth-navigation';

export default function CuentaView() {
  const { seccion, returnTo } = useLocalSearchParams<{ seccion: string; returnTo?: string | string[] }>();
  const { destino, requiereSesion, status } = useCuentaViewModel(seccion);
  const backHref = destino.backHref === '/autenticacion' ? { pathname: '/autenticacion' as const, params: { returnTo: loginDestination(returnTo) } } : destino.backHref;
  if (requiereSesion && status === 'loading') return <Screen title={destino.titulo}><LoadingState label="Restaurando sesión…" /></Screen>;
  if (requiereSesion && status === 'anonymous') return <Redirect href={{ pathname: '/autenticacion', params: { returnTo: '/cuenta/' + destino.seccion } }} />;
  return (
    <Screen title={destino.titulo} backHref={backHref} compactHeader>
      <ContenidoCuenta destino={destino} />
    </Screen>
  );
}

function ContenidoCuenta({ destino }: { destino: DestinoCuenta }) {
  switch (destino.modulo) {
    case 'autenticacion': return <AutenticacionSeccionView key={destino.seccion} seccion={destino.seccion} />;
    case 'vacia': return null;
  }
}
