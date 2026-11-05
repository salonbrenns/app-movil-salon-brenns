import { useCallback } from 'react';
import { HttpInscripcionesService } from '../services/inscripciones-service';
import { useSessionResource } from '@/shared/viewmodels/use-session-resource';
import { usePaginationViewModel } from '@/shared/viewmodels/use-pagination-view-model';
import { useAuthSession } from '@/modules/auth/viewmodels/auth-session-provider';
const service = new HttpInscripcionesService();
export function useMisCursosViewModel() {
  const { sessionRevision } = useAuthSession();
  const vm = useSessionResource(useCallback((signal?: AbortSignal) => service.listar({ signal }), []), 'mis-cursos');
  const pagination = usePaginationViewModel([...(vm.datos ?? [])].sort((a, b) => Date.parse(b.fecha) - Date.parse(a.fecha)), `mis-cursos:${sessionRevision}`, 2);
  return { ...vm, cursos: pagination.items, pagination };
}
