import { useCallback } from 'react';
import { useAuthSession } from '@/modules/auth/viewmodels/auth-session-provider';
import { useSessionResource } from '@/shared/viewmodels/use-session-resource';
import { HttpPerfilService } from '../services/perfil-service';

const service = new HttpPerfilService();

export function usePerfilViewModel() {
  const { session } = useAuthSession();
  const email = session?.user.email ?? '';
  const vm = useSessionResource(useCallback(
    (signal?: AbortSignal) => service.obtener(email, { signal }),
    [email],
  ));
  return { perfil: vm.datos, error: vm.error, cargando: vm.cargando, recargar: vm.recargar };
}
