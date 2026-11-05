import { Redirect, useLocalSearchParams } from 'expo-router';

import { LoadingState } from '@/components/feedback/async-states';
import { Screen } from '@/components/ui/screen';
import { AutenticacionSeccionView } from '@/modules/auth/views/autenticacion-seccion-view';
import { MisCursosView } from '@/modules/cursos/views/mis-cursos-view';
import { FavoritosView } from '@/modules/favoritos/views/favoritos-view';
import { CuentaInformacionView } from './cuenta-informacion-view';
import { RecuperacionView } from '@/modules/auth/views/recuperacion-view';
import { ComprasView } from '@/modules/ventas/views/compras-view';
import { EditarPerfilView } from '@/modules/perfil/views/editar-perfil-view';
import { SeguridadView } from '@/modules/perfil/views/seguridad-view';
import type { DestinoCuenta } from '@/modules/cuenta/viewmodels/cuenta-state';
import { useCuentaViewModel } from '@/modules/cuenta/viewmodels/use-cuenta-view-model';
import { loginDestination } from '@/modules/auth/models/auth-navigation';

export default function CuentaView() {
  const { seccion, returnTo, token } = useLocalSearchParams<{ seccion: string; returnTo?: string | string[]; token?: string }>();
  const { destino, requiereSesion, status } = useCuentaViewModel(seccion);
  const backHref = destino.backHref === '/autenticacion' ? { pathname: '/autenticacion' as const, params: { returnTo: loginDestination(returnTo) } } : destino.backHref;
  if (requiereSesion && status === 'loading') return <Screen title={destino.titulo}><LoadingState label="Restaurando sesión…" /></Screen>;
  if (requiereSesion && status === 'anonymous') return <Redirect href={{ pathname: '/autenticacion', params: { returnTo: '/cuenta/' + destino.seccion } }} />;
  return (
    <Screen title={destino.titulo} backHref={backHref} compactHeader>
      <ContenidoCuenta destino={destino} token={token} />
    </Screen>
  );
}

function ContenidoCuenta({ destino, token }: { destino: DestinoCuenta; token?: string }) {
  switch (destino.modulo) {
    case 'cursos': return <MisCursosView />;
    case 'favoritos': return <FavoritosView />;
    case 'informacion': return destino.seccion === 'recuperar-contrasena' ? <RecuperacionView /> : destino.seccion === 'nueva-contrasena' ? <RecuperacionView nueva token={token} /> : destino.seccion === 'compras' ? <ComprasView /> : destino.seccion === 'editar-perfil' ? <EditarPerfilView /> : destino.seccion === 'seguridad' ? <SeguridadView /> : <CuentaInformacionView seccion={destino.seccion} />;
    case 'autenticacion': return <AutenticacionSeccionView key={destino.seccion} seccion={destino.seccion} />;
    case 'vacia': return null;
  }
}
