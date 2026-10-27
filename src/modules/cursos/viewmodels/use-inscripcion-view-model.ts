import { useCallback, useState } from 'react';
import { useAuthSession } from '@/modules/auth/viewmodels/auth-session-provider';
import { useSessionResource } from '@/shared/viewmodels/use-session-resource';
import { useTransferenciaViewModel } from '@/shared/viewmodels/use-transferencia-view-model';
import { HttpInscripcionesService } from '../services/inscripciones-service';
import { cursoFinalizado, type Curso } from '../models/curso';
import type { InscripcionCreada } from '../models/inscripcion';
import { localCalendarDay } from '@/shared/viewmodels/calendar';
import { useCurrentTime } from '@/shared/viewmodels/use-current-time';
const service = new HttpInscripcionesService();
export function useInscripcionViewModel(curso: Curso) {
  const { session, sessionRevision } = useAuthSession();
  const finalizado = cursoFinalizado(curso, localCalendarDay(new Date(useCurrentTime())));
  const scope = sessionRevision + ':' + curso.id;
  const [receipt, setReceipt] = useState<{ scope: string; inscripcion: InscripcionCreada } | null>(null);
  const vm = useSessionResource(useCallback((signal?: AbortSignal) => service.listar({ signal }), []));
  const transferencia = useTransferenciaViewModel();
  const inscripcion = receipt?.scope === scope ? receipt.inscripcion : null;
  const existing = vm.datos?.find((item) => item.cursoId === curso.id && item.estado === 'ACTIVO');
  const pendingPayment = existing?.pagos.find((item) => item.estado === 'PENDIENTE' && !item.comprobanteRecibido);
  const proofReceived = existing?.pagos.some((item) => item.comprobanteRecibido) ?? false;
  const pagoId = inscripcion?.pagoId ?? pendingPayment?.id ?? null;
  const inscrito = !!inscripcion || !!existing;
  const permitido = !session?.user.role || session.user.role === 'CLIENTE';
  const sinCupo = curso.cupoMaximo != null && curso.inscritos != null && curso.inscritos >= curso.cupoMaximo;
  const puedeInscribir = !inscrito && permitido && !sinCupo && !finalizado && !vm.ocupado && !vm.cargando && !vm.error && !!vm.datos && !!transferencia.datos && !transferencia.cargando && !transferencia.error;
  return { ...vm, transferencia, inscripcion, inscrito, pagoId, proofReceived, permitido, sinCupo, finalizado, puedeInscribir,
    inscribir: (onCreated?: (pagoId: string) => void) => puedeInscribir ? vm.ejecutar(() => service.inscribir(curso.id),
      (item) => 'Inscripción #' + item.inscripcionId + ' registrada.',
      (item) => { setReceipt({ scope, inscripcion: item }); onCreated?.(item.pagoId); }) : Promise.resolve(false) };
}
