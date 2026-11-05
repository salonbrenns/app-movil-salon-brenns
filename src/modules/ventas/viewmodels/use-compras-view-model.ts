import { useCallback, useState } from 'react';
import { useSessionResource } from '@/shared/viewmodels/use-session-resource';
import { HttpVentasService } from '../services/ventas-service';
import { HttpComprobanteService } from '@/shared/services/comprobante-service';
import type { DocumentPickerAsset } from 'expo-document-picker';
import { usePaginationViewModel } from '@/shared/viewmodels/use-pagination-view-model';
import { useAuthSession } from '@/modules/auth/viewmodels/auth-session-provider';

const service = new HttpVentasService();
const comprobantes = new HttpComprobanteService();
export function useComprasViewModel() {
  const { sessionRevision } = useAuthSession();
  const vm = useSessionResource(useCallback((signal?: AbortSignal) => service.listar({ signal }), []), 'compras');
  const [seccion, setSeccion] = useState('Actuales');
  const [detalle, setDetalle] = useState<string | null>(null);
  const sorted = [...(vm.datos ?? [])].sort((a, b) => Date.parse(b.fecha) - Date.parse(a.fecha));
  const actuales = usePaginationViewModel(sorted.filter(item => !['ENTREGADO', 'CANCELADO'].includes(item.estado)), `actuales:${sessionRevision}`, 5);
  const historial = usePaginationViewModel(sorted.filter(item => ['ENTREGADO', 'CANCELADO'].includes(item.estado)), `historial:${sessionRevision}`, 5);
  const pagination = seccion === 'Actuales' ? actuales : historial;
  return { ...vm, seccion, setSeccion, detalle, setDetalle, pedidos: pagination.items, pagination,
    enviarComprobante: async (id: string, asset: DocumentPickerAsset) => { await comprobantes.subir('pedidos', id, asset); await vm.recargar(); } };
}
