import { useCallback, useState } from 'react';
import { HttpCarritoService } from '../services/carrito-service';
import { usePerfilViewModel } from '@/modules/perfil/viewmodels/use-perfil-view-model';
import { useSessionResource } from '@/shared/viewmodels/use-session-resource';
import { useAuthSession } from '@/modules/auth/viewmodels/auth-session-provider';
const service = new HttpCarritoService();
export function useCarritoViewModel() {
  const vm = useSessionResource(useCallback((signal?: AbortSignal) => service.obtener({ signal }), []));
  const profile = usePerfilViewModel();
  const { sessionRevision } = useAuthSession();
  const [selection, setSelection] = useState<{ revision: number; metodo: string } | null>(null);
  const metodoPago = selection?.revision === sessionRevision ? selection.metodo : 'transferencia';
  const existenciasValidas = !!vm.datos?.items.length && vm.datos.items.every((item) => item.cantidad > 0 && item.cantidad <= item.stock);
  return { ...vm, items: vm.datos?.items ?? [], resumen: vm.datos?.resumen ?? null, perfil: profile.perfil, errorPerfil: profile.error, recargarPerfil: profile.recargar,
    pedidoDisponible: false,
    metodoPago, existenciasValidas, cambiarMetodoPago: (metodo: string) => setSelection({ revision: sessionRevision, metodo }),
    eliminar: (id: string) => vm.ejecutar(() => service.eliminar(id), 'Producto eliminado del carrito.'),
    cambiarCantidad: (id: string, cantidad: number) => vm.ejecutar(() => service.cantidad(id, cantidad), 'Cantidad actualizada.'),
    vaciar: () => vm.ejecutar(() => service.eliminar(), 'Carrito vaciado.') };
}
