import { useCallback, useState } from 'react';
import { SECCIONES_AGENDA } from '../models/cita';
import { HttpAgendaService } from '../services/agenda-service';
import { useSessionResource } from '@/shared/viewmodels/use-session-resource';
import { useCurrentTime } from '@/shared/viewmodels/use-current-time';
import { useAuthSession } from '@/modules/auth/viewmodels/auth-session-provider';
import { HttpComprobanteService } from '@/shared/services/comprobante-service';
import type { DocumentPickerAsset } from 'expo-document-picker';
import { usePaginationViewModel } from '@/shared/viewmodels/use-pagination-view-model';
import { appointmentTime } from './appointment-time';
const service = new HttpAgendaService();
const comprobantes = new HttpComprobanteService();
export function useAgendaViewModel() {
  const vm = useSessionResource(useCallback((signal?: AbortSignal) => service.listar({ signal }), []), 'agenda');
  const [seccion, setSeccion] = useState('Próximas');
  const now = useCurrentTime();
  const { sessionRevision } = useAuthSession();
  const [detalle, setDetalle] = useState<{ revision: number; id: string } | null>(null);
  const detalleId = detalle?.revision === sessionRevision ? detalle.id : null;
  const proxima = (cita: NonNullable<typeof vm.datos>[number]) => ['PENDIENTE', 'CONFIRMADA'].includes(cita.estado) && appointmentTime(cita) >= now;
  const proximas = usePaginationViewModel((vm.datos ?? []).filter(proxima).sort((a, b) => appointmentTime(a) - appointmentTime(b)), `proximas:${sessionRevision}`, 4);
  const historial = usePaginationViewModel((vm.datos ?? []).filter(cita => !proxima(cita)).sort((a, b) => appointmentTime(b) - appointmentTime(a)), `historial:${sessionRevision}`, 4);
  const pagination = seccion === 'Próximas' ? proximas : historial;
  return { ...vm, now, citas: pagination.items, pagination, detalleId, verDetalle: (id: string) => setDetalle(detalleId === id ? null : { revision: sessionRevision, id }), secciones: SECCIONES_AGENDA, seccionSeleccionada: seccion,
    seleccionarSeccion: setSeccion, cancelar: (id: string) => vm.ejecutar(() => service.cancelar(id), 'Cita cancelada.', undefined, 'cancelar-cita'),
    enviarComprobante: async (id: string, asset: DocumentPickerAsset) => { await comprobantes.subir('citas', id, asset); await vm.recargar(); } };
}
