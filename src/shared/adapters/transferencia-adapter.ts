import { record, decimal } from './validation';
import { AdapterError } from './adapter-error';
import { anticipoPorcentajeWeb, bancoAprobado } from '@/config/transferencia-aprobada';
import type { ConfigTransferencia, DatosBancarios } from '../models/transferencia';
import { cents, money } from './account-validation';
import { InputError } from './input-error';

function optional(value: unknown): string | null { return typeof value === 'string' && value.trim() ? value.trim() : null; }
export function transferenciaResponse(value: unknown): ConfigTransferencia {
  const dto = record(value, 'config-sitio');
  const tieneBancoApi = ['banco_banco', 'banco_titular', 'banco_cuenta', 'banco_clabe'].some((key) => Object.prototype.hasOwnProperty.call(dto, key));
  const titular = optional(dto.banco_titular), banco = optional(dto.banco_banco);
  const cuenta = optional(dto.banco_cuenta), clabe = optional(dto.banco_clabe);
  let datosBancarios: DatosBancarios = bancoAprobado;
  if (tieneBancoApi) {
    if (!banco) throw new AdapterError('config-sitio.banco_banco', 'banco no vacío');
    if (!titular) throw new AdapterError('config-sitio.banco_titular', 'titular no vacío');
    if (!cuenta || !/^\d{10,18}$/.test(cuenta.replace(/\s/g, ''))) throw new AdapterError('config-sitio.banco_cuenta', 'cuenta de 10 a 18 dígitos');
    if (!clabe || !/^\d{18}$/.test(clabe.replace(/\s/g, ''))) throw new AdapterError('config-sitio.banco_clabe', 'CLABE de 18 dígitos');
    datosBancarios = { titular, banco, cuenta, clabe, celular: optional(dto.banco_celular) };
  }
  const porcentaje = dto.anticipo_porcentaje == null || dto.anticipo_porcentaje === '' ? anticipoPorcentajeWeb : Number(dto.anticipo_porcentaje);
  if (!Number.isFinite(porcentaje) || porcentaje <= 0 || porcentaje > 100) throw new AdapterError('config-sitio.anticipo_porcentaje', 'porcentaje mayor que 0 y hasta 100');
  decimal(porcentaje, 'config-sitio.anticipo_porcentaje');
  return { banco: datosBancarios,
    anticipoPorcentaje: porcentaje, fuente: tieneBancoApi ? 'api' : 'aprobada' };
}

export function importeReserva(precio: number | string, tipoPago: 'ANTICIPO' | 'COMPLETO', porcentaje: number): string {
  const precioCentavos = cents(precio);
  if (precioCentavos < 0n) throw new InputError('Importe de reserva inválido.');
  if (tipoPago === 'COMPLETO') return money(precioCentavos);
  if (!Number.isFinite(porcentaje) || porcentaje <= 0 || porcentaje > 100)
    throw new InputError('Porcentaje de anticipo inválido.');
  const porcentajeCentésimas = cents(porcentaje);
  // El importe enviado al servidor se expresa en centavos; los medios centavos se redondean hacia arriba.
  return money((precioCentavos * porcentajeCentésimas + 5000n) / 10000n);
}
