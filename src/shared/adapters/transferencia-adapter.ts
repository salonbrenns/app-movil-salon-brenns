import { record, decimal } from './validation';
import { AdapterError } from './adapter-error';
import { bancoAprobado, anticipoPorcentajeWeb } from '@/config/transferencia-aprobada';
import type { ConfigTransferencia } from '../models/transferencia';

function optional(value: unknown): string | null { return typeof value === 'string' && value.trim() ? value.trim() : null; }
export function transferenciaResponse(value: unknown): ConfigTransferencia {
  const dto = record(value, 'config-sitio');
  const titular = optional(dto.banco_titular), banco = optional(dto.banco_banco);
  const cuenta = optional(dto.banco_cuenta), clabe = optional(dto.banco_clabe);
  const complete = !!(titular && banco && (cuenta || clabe));
  if (!complete && (titular || banco || cuenta || clabe || optional(dto.banco_celular))) throw new AdapterError('config-sitio.datos-bancarios', 'titular, banco y cuenta o CLABE completos');
  const porcentaje = dto.anticipo_porcentaje == null || dto.anticipo_porcentaje === '' ? anticipoPorcentajeWeb : Number(dto.anticipo_porcentaje);
  if (!Number.isFinite(porcentaje) || porcentaje <= 0 || porcentaje > 100) throw new AdapterError('config-sitio.anticipo_porcentaje', 'porcentaje mayor que 0 y hasta 100');
  decimal(porcentaje, 'config-sitio.anticipo_porcentaje');
  return { banco: complete ? { titular: titular!, banco: banco!, cuenta, clabe, celular: optional(dto.banco_celular) } : bancoAprobado, anticipoPorcentaje: porcentaje, fuente: complete ? 'api' : 'aprobada' };
}
