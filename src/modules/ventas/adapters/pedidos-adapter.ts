import { identifier, list, nullableText, record, text } from '@/shared/adapters/validation';
import { cents, instant, integer, money } from '@/shared/adapters/account-validation';
import type { Pedido } from '../models/pedido';
import { totalEnPesos } from './ventas-adapter';
import { imageUri } from '@/shared/viewmodels/media-state';

export function pedidosResponse(value: unknown): readonly Pedido[] {
  return list(value, 'pedidos').map((entry) => {
    const dto = record(entry, 'pedido');
    const detalles = list(dto.detalles, 'pedido.detalles').map((entryDetail) => {
      const detail = record(entryDetail, 'pedido.detalle');
      return { id: identifier(detail.id, 'pedido.detalle.id'), nombre: text(detail.nombre_producto, 'pedido.detalle.nombre_producto'), variante: nullableText(detail.descripcion_variante, 'pedido.detalle.descripcion_variante'), cantidad: integer(detail.cantidad, 'pedido.detalle.cantidad', 1), precioUnitario: detail.precio_unitario == null ? null : totalEnPesos(detail.precio_unitario), subtotal: totalEnPesos(detail.subtotal), imagen: imageUri(detail.imagen) ?? null };
    });
    const total = totalEnPesos(dto.total);
    const productos = detalles.reduce((sum, detail) => sum + cents(detail.subtotal), 0n);
    const subtotalServidor = dto.subtotal == null ? null : totalEnPesos(dto.subtotal);
    const costoEnvio = dto.costo_envio == null ? null : totalEnPesos(dto.costo_envio);
    return {
      id: identifier(dto.id, 'pedido.id'),
      estado: text(dto.estado, 'pedido.estado'),
      total,
      importeProductos: money(productos),
      costoEnvio,
      requiereRevision: productos !== cents(total) || subtotalServidor !== null && productos !== cents(subtotalServidor) || detalles.some(item => item.precioUnitario !== null && cents(item.precioUnitario) * BigInt(item.cantidad) !== cents(item.subtotal)),
      fecha: instant(dto.fecha_pedido, 'pedido.fecha_pedido'),
      comprobanteRecibido: !!nullableText(dto.comprobante_url, 'pedido.comprobante_url'),
      detalles,
    };
  });
}
