import { useCallback, useState } from 'react';
import { HttpCarritoService } from '../services/carrito-service';
import { HttpVentasService } from '@/modules/ventas/services/ventas-service';
import { usePerfilViewModel } from '@/modules/perfil/viewmodels/use-perfil-view-model';
import { useSessionResource } from '@/shared/viewmodels/use-session-resource';
import { formatPrice } from '@/utils/format-price';
import { useAuthSession } from '@/modules/auth/viewmodels/auth-session-provider';
import type { PedidoCreado } from '@/modules/ventas/adapters/ventas-adapter';
import { HttpComprobanteService } from '@/shared/services/comprobante-service';
import type { DocumentPickerAsset } from 'expo-document-picker';
import { useTransferenciaViewModel } from '@/shared/viewmodels/use-transferencia-view-model';
const service = new HttpCarritoService(); const ventas = new HttpVentasService();
const comprobantes = new HttpComprobanteService();
export function useCarritoViewModel() {
  const vm = useSessionResource(useCallback((signal?: AbortSignal) => service.obtener({ signal }), []));
  const { sessionRevision } = useAuthSession();
  const [lastOrder, setLastOrder] = useState<{ revision: number; order: PedidoCreado } | null>(null);
  const [proofSent, setProofSent] = useState<string | null>(null);
  const profile = usePerfilViewModel();
  const transferencia = useTransferenciaViewModel();
  const metodoPago = 'transferencia';
  const existenciasValidas = !!vm.datos?.items.length && vm.datos.items.every((item) => item.cantidad > 0 && item.cantidad <= item.stock);
  return { ...vm, items: vm.datos?.items ?? [], resumen: vm.datos?.resumen ?? null, perfil: profile.perfil, errorPerfil: profile.error, recargarPerfil: profile.recargar, transferencia, pedidoRegistrado: lastOrder?.revision === sessionRevision ? lastOrder.order : null, comprobanteEnviado: lastOrder?.revision === sessionRevision && proofSent === lastOrder.order.id,
    metodoPago, existenciasValidas,
    eliminar: (id: string) => vm.ejecutar(() => service.eliminar(id), 'Producto eliminado del carrito.'),
    cambiarCantidad: (id: string, cantidad: number) => vm.ejecutar(() => service.cantidad(id, cantidad), 'Cantidad actualizada.'),
    vaciar: () => vm.ejecutar(() => service.eliminar(), 'Carrito vaciado.'),
    confirmarPedido: () => profile.perfil && existenciasValidas ? vm.ejecutar(() => ventas.crear(metodoPago, profile.perfil!), (pedido) => 'Pedido #' + pedido.id + ' registrado. Total: ' + formatPrice(pedido.total) + '. Pago pendiente de validación.', (order) => setLastOrder({ revision: sessionRevision, order })) : Promise.resolve(false),
    enviarComprobante: async (asset: DocumentPickerAsset) => { const order = lastOrder?.revision === sessionRevision ? lastOrder.order : null; if (!order) throw new Error('Primero registra el pedido.'); await comprobantes.subir('pedidos', order.id, asset); setProofSent(order.id); await vm.recargar(); },
  };
}
