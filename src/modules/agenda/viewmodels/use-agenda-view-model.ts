import { useCallback, useState } from 'react';
import { SECCIONES_AGENDA } from '../models/cita';
import { HttpAgendaService } from '../services/agenda-service';
import { useSessionResource } from '@/shared/viewmodels/use-session-resource';
import { useCurrentTime } from '@/shared/viewmodels/use-current-time';
import { useAuthSession } from '@/modules/auth/viewmodels/auth-session-provider';
import { HttpComprobanteService } from '@/shared/services/comprobante-service';
import type { DocumentPickerAsset } from 'expo-document-picker';
const service = new HttpAgendaService();
const comprobantes = new HttpComprobanteService();
export function useAgendaViewModel() {
  const vm = useSessionResource(useCallback((signal?: AbortSignal) => service.listar({ signal }), []));
  const [seccion, setSeccion] = useState('Próximas');
  const now = useCurrentTime();
  const { sessionRevision } = useAuthSession();
  const [detalle, setDetalle] = useState<{ revision: number; id: string } | null>(null);
  const detalleId = detalle?.revision === sessionRevision ? detalle.id : null;
  const citas = (vm.datos ?? []).filter((cita) => {
    const proxima = ['PENDIENTE', 'CONFIRMADA'].includes(cita.estado) && Date.parse(cita.fecha) >= now;
    return seccion === 'Próximas' ? proxima : !proxima;
  });
  return { ...vm, now, citas, detalleId, verDetalle: (id: string) => setDetalle(detalleId === id ? null : { revision: sessionRevision, id }), secciones: SECCIONES_AGENDA, seccionSeleccionada: seccion,
    seleccionarSeccion: setSeccion, cancelar: (id: string) => vm.ejecutar(() => service.cancelar(id), 'Cita cancelada.'),
    enviarComprobante: async (id: string, asset: DocumentPickerAsset) => { await comprobantes.subir('citas', id, asset); await vm.recargar(); } };
}
