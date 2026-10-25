import { AdapterError } from '@/shared/adapters/adapter-error';
import { money } from '@/shared/adapters/account-validation';
import { identifier, record, text } from '@/shared/adapters/validation';

export type PedidoCreado = Readonly<{ id: string; total: string }>;

/** The backend returns pesos as a JSON number, including binary float noise from its sum. */
export function totalEnPesos(value: unknown): string {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) {
    throw new AdapterError('pedido.total', 'importe numérico no negativo en pesos');
  }
  const centavos = Math.round(value * 100);
  if (!Number.isSafeInteger(centavos)) {
    throw new AdapterError('pedido.total', 'importe con centavos seguros');
  }
  // Accept only IEEE-754 representation noise, never a real fraction of a cent.
  const tolerance = Number.EPSILON * Math.max(1, Math.abs(value)) * 8;
  if (Math.abs(value - centavos / 100) > tolerance) {
    throw new AdapterError('pedido.total', 'importe preciso a centavos');
  }
  return money(BigInt(centavos));
}

export function pedidoCreadoResponse(value: unknown, metodoEsperado: 'transferencia'): PedidoCreado {
  const dto = record(value, 'pedido');
  if (dto.ok !== true) throw new AdapterError('pedido.ok', 'confirmación true');
  const id = identifier(dto.pedido_id, 'pedido.pedido_id');
  const total = totalEnPesos(dto.total);
  if (text(dto.metodo_pago, 'pedido.metodo_pago') !== metodoEsperado) {
    throw new AdapterError('pedido.metodo_pago', 'método de pago solicitado');
  }
  return { id, total };
}
