import { AdapterError } from './adapter-error';
import { calendarDate, decimal, text } from './validation';
import { InputError } from './input-error';
export function integer(value: unknown, path: string, minimum = 0): number {
  if (typeof value !== 'number' || !Number.isSafeInteger(value) || value < minimum) throw new AdapterError(path, 'entero válido');
  return value;
}
export function apiId(value: string): number {
  if (!/^[1-9]\d*$/.test(value) || !Number.isSafeInteger(Number(value))) throw new InputError('Identificador inválido.');
  return Number(value);
}
export function instant(value: unknown, path: string): string {
  const result = text(value, path);
  if (!Number.isFinite(Date.parse(result))) throw new AdapterError(path, 'fecha válida');
  return result;
}

export function cents(value: string | number): bigint {
  const amount = decimal(value, 'importe');
  const match = /^(-?)(\d+)(?:\.(\d{1,2}))?$/.exec(amount);
  if (!match) throw new AdapterError('importe', 'un importe con centavos exactos');
  const [, sign, units, fraction = ''] = match;
  const result = BigInt(units) * 100n + BigInt(fraction.padEnd(2, '0'));
  return sign ? -result : result;
}

export function money(value: bigint): string {
  const absolute = value < 0n ? -value : value;
  return `${value < 0n ? '-' : ''}${absolute / 100n}.${String(absolute % 100n).padStart(2, '0')}`;
}

export function day(value: string): string {
  try {
    const result = calendarDate(value, 'fecha');
    if (result !== value) throw new InputError('Fecha inválida.');
    return result;
  } catch {
    throw new InputError('Fecha inválida.');
  }
}

export function hour(value: unknown): string {
  const result = text(value, 'hora');
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(result))
    throw new AdapterError('hora', 'hora HH:mm válida');
  return result;
}
