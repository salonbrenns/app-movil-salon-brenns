
import { AdapterError } from './adapter-error';
import { InputError } from './input-error';
import { calendarDate, decimal, text } from './validation';

// Validar números enteros
export function integer(
  value: unknown,
  path: string,
  minimum = 0
): number {
  if (
    typeof value !== 'number' ||
    !Number.isSafeInteger(value) ||
    value < minimum
  ) {
    throw new AdapterError(path, 'entero válido');
  }

  return value;
}

// Validar identificadores de la API
export function apiId(value: string): number {
  if (
    !/^[1-9]\d*$/.test(value) ||
    !Number.isSafeInteger(Number(value))
  ) {
    throw new InputError('Identificador inválido.');
  }

  return Number(value);
}

// Validar fechas y horas ISO
export function instant(
  value: unknown,
  path: string
): string {
  const result = text(value, path);

  if (!Number.isFinite(Date.parse(result))) {
    throw new AdapterError(path, 'fecha válida');
  }

  return result;
}

// Convertir importes a centavos sin redondeos
export function cents(value: string | number): bigint {
  const amount = decimal(value, 'importe');
  const invalid = () => new AdapterError('importe', 'un importe con centavos exactos');
  let index = amount[0] === '-' ? 1 : 0;
  const negative = index === 1;
  const unitsStart = index;
  while (index < amount.length) {
    const digit = amount.charCodeAt(index) - 48;
    if (digit < 0 || digit > 9) break;
    index++;
  }
  if (index === unitsStart) throw invalid();
  const unitsEnd = index;
  let fraction = 0n;
  if (index < amount.length) {
    if (amount[index++] !== '.' || index === amount.length) throw invalid();
    const remaining = amount.length - index;
    if (remaining > 2) throw invalid();
    while (index < amount.length) {
      const digit = amount.charCodeAt(index++) - 48;
      if (digit < 0 || digit > 9) throw invalid();
      fraction = fraction * 10n + BigInt(digit);
    }
    if (remaining === 1) fraction *= 10n;
  }
  const result = BigInt(amount.slice(unitsStart, unitsEnd)) * 100n + fraction;
  return negative ? -result : result;
}

// Convertir centavos a pesos
export function money(value: bigint): string {
  if (value < 0n) {
    throw new InputError('Importe inválido.');
  }

  return (
    `${value / 100n}.` +
    String(value % 100n).padStart(2, '0')
  );
}

// Validar fechas de calendario
export function day(value: string): string {
  try {
    const result = calendarDate(value, 'fecha');

    if (result !== value) {
      throw new InputError('Fecha inválida.');
    }

    return result;
  } catch {
    throw new InputError('Fecha inválida.');
  }
}

// Validar horarios HH:mm
export function hour(value: unknown): string {
  const result = text(value, 'hora');

  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(result)) {
    throw new AdapterError(
      'hora',
      'hora HH:mm válida'
    );
  }

  return result;
}
