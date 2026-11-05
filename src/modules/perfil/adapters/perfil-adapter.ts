import { record, text, nullableText } from '@/shared/adapters/validation';
import { AdapterError } from '@/shared/adapters/adapter-error';
import { SessionDataError } from '@/shared/adapters/session-data-error';
import type { Perfil } from '../models/perfil';
export function perfilResponse(value: unknown, expectedEmail?: string): Perfil {
  const dto = record(value, 'perfil');
  const fechaRegistro = dto.fecha_registro == null ? null : text(dto.fecha_registro, 'perfil.fecha_registro');
  if (fechaRegistro && !Number.isFinite(Date.parse(fechaRegistro))) throw new AdapterError('perfil.fecha_registro', 'fecha válida');
  const correo = text(dto.correo, 'perfil.correo');
  if (expectedEmail && correo !== expectedEmail) throw new SessionDataError('El perfil recibido no corresponde a tu sesión. Inicia sesión de nuevo.');
  return { nombre: text(dto.nombre, 'perfil.nombre'), correo, telefono: dto.telefono == null ? null : nullableText(dto.telefono, 'perfil.telefono'), fechaRegistro };
}
