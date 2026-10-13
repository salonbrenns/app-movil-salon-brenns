import { AdapterError } from './adapter-error';
import { text } from './validation';
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
