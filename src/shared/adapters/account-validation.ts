import { AdapterError } from "./adapter-error";
import { InputError } from "./input-error";
import { calendarDate, text } from "./validation";
export function integer(value: unknown, path: string, minimum = 0): number {
  if (
    typeof value !== "number" ||
    !Number.isSafeInteger(value) ||
    value < minimum
  )
    throw new AdapterError(path, "entero válido");
  return value;
}
export function apiId(value: string): number {
  if (!/^[1-9]\d*$/.test(value) || !Number.isSafeInteger(Number(value)))
    throw new InputError("Identificador inválido.");
  return Number(value);
}
export function instant(value: unknown, path: string): string {
  const result = text(value, path);
  if (!Number.isFinite(Date.parse(result)))
    throw new AdapterError(path, "fecha válida");
  return result;
}
export function cents(value: number | string): bigint {
  const raw = String(value);

  if (!/^-?\d+(?:\.\d{1,2})?$/.test(raw)) {
    throw new InputError("Importe inválido.");
  }

  const negative = raw.startsWith("-");
  const normalized = negative ? raw.slice(1) : raw;

  const [integer, fraction = ""] = normalized.split(".");

  const result = BigInt(integer) * 100n + BigInt(fraction.padEnd(2, "0"));

  return negative ? -result : result;
}

export function money(value: bigint): string {
  if (value < 0n) throw new InputError("Importe inválido.");
  return `${value / 100n}.${String(value % 100n).padStart(2, "0")}`;
}

export function day(value: string): string {
  try {
    const result = calendarDate(value, "fecha");
    if (result !== value) throw new InputError("Fecha inválida.");
    return result;
  } catch {
    throw new InputError("Fecha inválida.");
  }
}

export function hour(value: unknown): string {
  const result = text(value, "hora");
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(result))
    throw new AdapterError("hora", "hora HH:mm válida");
  return result;
}
