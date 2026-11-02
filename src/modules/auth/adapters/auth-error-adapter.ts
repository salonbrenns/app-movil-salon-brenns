import { HttpError } from '@/services/api';
import { AuthError } from '../models/auth-error';
import { AdapterError } from '@/shared/adapters/adapter-error';
import { userError } from '@/shared/adapters/user-error';

export function authError(error: unknown, operation?: string): AuthError {
  if (error instanceof AuthError) {
    if (!operation || error.operation) return error;
    return new AuthError(error.message, error.code, error.status, error.path, operation);
  }
  if (error instanceof HttpError) {
    const record = typeof error.body === 'object' && error.body !== null ? error.body as Record<string, unknown> : {};
    const fallback = error.status === 429 ? 'Demasiadas solicitudes. Intenta de nuevo en unos minutos.'
      : error.status === 409 ? 'Ya existe una cuenta con ese correo.'
        : error.status === 400 ? 'Revisa los datos ingresados.'
          : error.status >= 500 ? 'El servidor no pudo procesar la solicitud. Intenta más tarde.'
            : 'El servidor rechazó la solicitud.';
    return new AuthError(typeof record.error === 'string' ? record.error : fallback, typeof record.code === 'string' ? record.code : undefined, error.status, error.path.split('?')[0], operation);
  }
  if (error instanceof TypeError) return new AuthError('Error de conexión', userError(error).kind === 'conexion' ? 'NETWORK_ERROR' : 'UNKNOWN_ERROR', undefined, undefined, operation);
  if (error instanceof AdapterError) return new AuthError('Respuesta inesperada', 'INVALID_RESPONSE', undefined, undefined, operation);
  return new AuthError(error instanceof Error ? error.message : 'Error desconocido', 'UNKNOWN_ERROR', undefined, undefined, operation);
}

export function authErrorMessage(error: AuthError): string {
  if (error.code === 'NETWORK_ERROR') return 'No pudimos conectarnos. Revisa tu conexión e inténtalo nuevamente.';
  if (error.status === 429) return 'Demasiados intentos. Inténtalo nuevamente en unos minutos.';
  const operation = error.operation ?? '';
  if (operation === 'Acceso') {
    if (error.code === 'EMAIL_NOT_VERIFIED') return 'Verifica tu correo electrónico antes de iniciar sesión.';
    if (error.code === 'ACCOUNT_LOCKED') return 'Tu cuenta está bloqueada. Contacta al establecimiento.';
    if (error.code === 'ACCOUNT_INACTIVE') return 'Tu cuenta está desactivada. Contacta al establecimiento.';
    if (error.code === 'WRONG_PASSWORD' || error.code === 'USER_NOT_FOUND' || error.code === 'CredentialsSignin' || error.status === 401) return 'No pudimos iniciar sesión. Revisa tu correo y contraseña.';
    return 'No pudimos iniciar sesión. Inténtalo nuevamente.';
  }
  if (operation === 'Registro') {
    if (error.status === 400 && error.message === 'Nombre, correo, teléfono y contraseña son requeridos') return 'Completa los campos obligatorios.';
    if (error.status === 400 && error.message === 'El formato del correo electrónico no es válido') return 'Ingresa un correo electrónico válido.';
    if (error.status === 400 && error.message === 'La contraseña debe tener al menos 8 caracteres') return 'La contraseña debe tener al menos 8 caracteres.';
    return 'No pudimos crear tu cuenta. Inténtalo nuevamente.';
  }
  if (error.status === 401) return 'Tu sesión ha expirado. Inicia sesión nuevamente.';
  if (operation === 'Recuperación de contraseña' || operation === 'Nueva contraseña') return 'No pudimos completar la recuperación. Inténtalo nuevamente.';
  if (operation === 'Verificación de correo' || operation === 'Reenvío de verificación') return 'No pudimos completar la verificación. Inténtalo nuevamente.';
  if (operation === 'Cierre de sesión') return 'No pudimos cerrar tu sesión. Inténtalo nuevamente.';
  return 'No pudimos completar la operación. Inténtalo nuevamente.';
}
