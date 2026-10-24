import { useCallback, useState } from 'react';
import { useSessionResource } from '@/shared/viewmodels/use-session-resource';
import { HttpVentasService } from '../services/ventas-service';
import { HttpComprobanteService } from '@/shared/services/comprobante-service';
import type { DocumentPickerAsset } from 'expo-document-picker';

const service = new HttpVentasService();
const comprobantes = new HttpComprobanteService();
export function useComprasViewModel() {
  const vm = useSessionResource(useCallback((signal?: AbortSignal) => service.listar({ signal }), []));
  const [seccion, setSeccion] = useState('Actuales');
  const [detalle, setDetalle] = useState<string | null>(null);
  const pedidos = (vm.datos ?? []).filter(item => {
    const finalizado = ['ENTREGADO', 'CANCELADO'].includes(item.estado);
    return seccion === 'Actuales' ? !finalizado : finalizado;
  });
  return { ...vm, seccion, setSeccion, detalle, setDetalle, pedidos,
    enviarComprobante: async (id: string, asset: DocumentPickerAsset) => { await comprobantes.subir('pedidos', id, asset); await vm.recargar(); } };
}
