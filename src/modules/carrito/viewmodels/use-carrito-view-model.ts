
import { useCallback, useRef, useState } from 'react';

import { HttpCarritoService } from '../services/carrito-service';
import { HttpVentasService } from '@/modules/ventas/services/ventas-service';
import { usePerfilViewModel } from '@/modules/perfil/viewmodels/use-perfil-view-model';
import { useSessionResource } from '@/shared/viewmodels/use-session-resource';
import { useAuthSession } from '@/modules/auth/viewmodels/auth-session-provider';
import { useTransferenciaViewModel } from '@/shared/viewmodels/use-transferencia-view-model';
import { HttpComprobanteService } from '@/shared/services/comprobante-service';
import { formatPrice } from '@/utils/format-price';

import type { PedidoCreado } from '@/modules/ventas/adapters/ventas-adapter';
import type { DocumentPickerAsset } from 'expo-document-picker';

const service = new HttpCarritoService();
const ventas = new HttpVentasService();
const comprobantes = new HttpComprobanteService();

export function useCarritoViewModel() {
  const vm = useSessionResource(
    useCallback(
      (signal?: AbortSignal) => service.obtener({ signal }),
      []
    )
  );

  const { sessionRevision } = useAuthSession();

  const [lastOrder, setLastOrder] = useState<{
    revision: number;
    order: PedidoCreado;
  } | null>(null);

  // Evita registrar nuevamente un pedido ya confirmado.
  const lastOrderRef = useRef<typeof lastOrder>(null);

  const [proofSent, setProofSent] = useState<string | null>(null);

  const profile = usePerfilViewModel();
  const transferencia = useTransferenciaViewModel();

  // Unico metodo de pago permitido.
  const metodoPago = 'transferencia';

  const existenciasValidas =
    !!vm.datos?.items.length &&
    vm.datos.items.every(
      (item) =>
        item.cantidad > 0 &&
        item.cantidad <= item.stock
    );

  const pedidoRegistrado =
    lastOrder?.revision === sessionRevision
      ? lastOrder.order
      : null;

  const comprobanteEnviado =
    !!pedidoRegistrado &&
    proofSent === pedidoRegistrado.id;

  return {
    ...vm,

    items: vm.datos?.items ?? [],
    resumen: vm.datos?.resumen ?? null,

    perfil: profile.perfil,
    errorPerfil: profile.error,
    recargarPerfil: profile.recargar,

    transferencia,
    pedidoRegistrado,
    comprobanteEnviado,

    metodoPago,
    existenciasValidas,

    eliminar: (id: string) =>
      vm.ejecutar(
        () => service.eliminar(id),
        'Producto eliminado del carrito.'
      ),

    cambiarCantidad: (id: string, cantidad: number) =>
      vm.ejecutar(
        () => service.cantidad(id, cantidad),
        'Cantidad actualizada.'
      ),

    vaciar: () =>
      vm.ejecutar(
        () => service.eliminar(),
        'Carrito vaciado.'
      ),

    confirmarPedido: (onCreated?: (id: string) => void) => {
      const perfil = profile.perfil;

      if (
        !perfil ||
        !existenciasValidas ||
        !transferencia.datos ||
        !!transferencia.error ||
        lastOrderRef.current?.revision === sessionRevision
      ) {
        return Promise.resolve(false);
      }

      return vm.ejecutar(
        () => ventas.crear(metodoPago, perfil),
        (pedido) =>
          'Pedido #' +
          pedido.id +
          ' registrado. Total: ' +
          formatPrice(pedido.total) +
          '.',
        (order) => {
          const confirmed = {
            revision: sessionRevision,
            order,
          };

          lastOrderRef.current = confirmed;
          setLastOrder(confirmed);
          onCreated?.(order.id);
        }
      );
    },

    enviarComprobante: async (asset: DocumentPickerAsset) => {
      const order =
        lastOrder?.revision === sessionRevision
          ? lastOrder.order
          : null;

      if (!order) {
        throw new Error('Primero registra el pedido.');
      }

      await comprobantes.subir(
        'pedidos',
        order.id,
        asset
      );

      setProofSent(order.id);
      await vm.recargar();
    },
  };
}
