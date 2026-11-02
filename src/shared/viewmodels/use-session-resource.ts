import { useCallback, useEffect, useMemo, useRef, useSyncExternalStore } from 'react';
import { useFocusEffect } from 'expo-router';
import { useAuthSession } from '@/modules/auth/viewmodels/auth-session-provider';
import { SessionResource } from './session-resource';
import type { ErrorContext } from '@/shared/adapters/user-error';

export function useSessionResource<T>(loader: (signal?: AbortSignal) => Promise<T>, context?: ErrorContext) {
  const { status, session, sessionRevision, dataRevision, refreshData } = useAuthSession();
  const authenticated = status === 'authenticated';
  const userId = session?.user.id;
  const resource = useMemo(() => new SessionResource(loader, authenticated, String(userId ?? 'anonymous') + ':' + sessionRevision, context), [loader, authenticated, userId, sessionRevision, context]);
  const state = useSyncExternalStore(resource.subscribe, resource.getSnapshot, resource.getSnapshot);
  const lastRevision = useRef(dataRevision);
  useFocusEffect(useCallback(() => {
    resource.activate();
    void resource.cargar();
    return resource.cancel;
  }, [resource]));
  useEffect(() => {
    if (lastRevision.current !== dataRevision) { lastRevision.current = dataRevision; void resource.cargar(); }
  }, [resource, dataRevision]);
  return { ...state, cargando: state.estadoCarga === 'cargando', authenticated, recargar: resource.cargar,
    ejecutar: <R>(operation: () => Promise<R>, message: string | ((result: R) => string), onConfirmed?: (result: R) => void, errorContext?: ErrorContext) => resource.ejecutar(operation, message, (result) => { lastRevision.current = refreshData(); onConfirmed?.(result); }, errorContext) };
}
