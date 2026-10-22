import { identifier, list, nullableText, record, text } from '@/shared/adapters/validation';
import { instant, integer } from '@/shared/adapters/account-validation';
import type { Pedido } from '../models/pedido';
import { totalEnPesos } from './ventas-adapter';

export function pedidosResponse(value: unknown): readonly Pedido[] {
  return list(value, 'pedidos').map((entry) => {
    const dto = record(entry, 'pedido');
    return {
      id: identifier(dto.id, 'pedido.id'),
      estado: text(dto.estado, 'pedido.estado'),
      total: totalEnPesos(dto.total),
      fecha: instant(dto.fecha_pedido, 'pedido.fecha_pedido'),
      comprobanteRecibido: !!nullableText(dto.comprobante_url, 'pedido.comprobante_url'),
      detalles: list(dto.detalles, 'pedido.detalles').map((entryDetail) => {
        const detail = record(entryDetail, 'pedido.detalle');
        return { id: identifier(detail.id, 'pedido.detalle.id'), nombre: text(detail.nombre_producto, 'pedido.detalle.nombre_producto'), variante: nullableText(detail.descripcion_variante, 'pedido.detalle.descripcion_variante'), cantidad: integer(detail.cantidad, 'pedido.detalle.cantidad', 1), subtotal: totalEnPesos(detail.subtotal) };
      }),
    };
  });
}
