import { HttpError } from '@/services/api';
import { userError } from '@/shared/adapters/user-error';
import { authError, authErrorMessage } from '@/modules/auth/adapters/auth-error-adapter';
import { AuthError } from '@/modules/auth/models/auth-error';

const http = (status: number, body: unknown, path: string) => new HttpError(status, body, path);

test.each([
  ['/api/usuario/password', 400, 'La contraseña actual es incorrecta', 'La contraseña actual es incorrecta. Inténtalo nuevamente.'],
  ['/api/cursos/10/inscribir', 409, 'Ya estás inscrito en este curso', 'Ya tienes una inscripción registrada para este curso.'],
  ['/api/cursos/10/inscribir', 409, 'El cupo del curso está completo', 'Este curso ya no tiene lugares disponibles.'],
  ['/api/citas', 409, 'Esa hora no está disponible', 'Ese horario ya no está disponible. Selecciona otro.'],
  ['/api/pedidos', 409, 'Stock insuficiente para "Producto"', 'No hay suficientes unidades de uno de los productos de tu carrito.'],
  ['/api/carrito', 404, 'Variante no disponible', 'Este producto ya no está disponible.'],
  ['/api/pedidos/1/comprobante', 415, 'Tipo de archivo no permitido. Solo se aceptan: JPG, PNG, WEBP o PDF', 'Este formato de archivo no es compatible.'],
  ['/api/citas/1/comprobante', 413, 'El archivo supera el límite de 10 MB', 'El archivo supera el tamaño permitido.'],
  ['/api/pagos-curso/1/comprobante', 409, 'Ya subiste un comprobante para este pago', 'Ya enviaste un comprobante para este pago.'],
] as const)('interpreta una causa confirmada en %s', (path, status, body, message) => {
  expect(userError(http(status, { error: body }, path)).message).toBe(message);
});

test.each([
  [http(500, { error: 'detalle interno de base de datos' }, '/api/cursos/10/inscribir'), 'inscripcion', 'No pudimos completar tu inscripción. Inténtalo nuevamente.'],
  [http(409, { error: 'conflicto no identificado' }, '/api/cursos/10/inscribir'), 'inscripcion', 'No pudimos completar tu inscripción. Inténtalo nuevamente.'],
  [http(500, { error: 'Cloudinary credentials' }, '/api/citas/1/comprobante'), 'subir-comprobante', 'No pudimos subir tu comprobante. Inténtalo nuevamente.'],
  [http(500, '<html>stack trace</html>', '/api/pedidos'), 'pedido', 'No pudimos completar tu pedido. Inténtalo nuevamente.'],
  [new Error('FormData failed /api/internal'), 'subir-comprobante', 'No pudimos subir tu comprobante. Inténtalo nuevamente.'],
] as const)('no muestra causas desconocidas ni detalles técnicos', (failure, context, message) => {
  const result = userError(failure, context);
  expect(result.message).toBe(message);
  expect(result.message).not.toMatch(/HTTP|\/api\/|Cloudinary|FormData|base de datos|stack trace/);
});

test('distingue sesión, permiso, conexión, tiempo agotado y error desconocido', () => {
  expect(userError(http(401, { error: 'No autorizado' }, '/api/carrito'))).toEqual({ kind: 'sesion', message: 'Tu sesión ha expirado. Inicia sesión nuevamente.' });
  expect(userError(http(403, { error: 'detalle privado' }, '/api/carrito')).kind).toBe('permiso');
  expect(userError(new TypeError('Network request failed')).kind).toBe('conexion');
  expect(userError(new TypeError('Network request failed'), 'pedido').message).toBe('No pudimos confirmar el estado de tu pedido. Revisa Mis compras antes de intentarlo nuevamente.');
  expect(userError(new TypeError('invalid internal object')).kind).toBe('respuesta');
  const timeout = new Error('timeout'); timeout.name = 'TimeoutError';
  expect(userError(timeout).message).toBe('La operación está tardando demasiado. Inténtalo nuevamente.');
  expect(userError({ private: 'value' }).message).toBe('No pudimos completar la operación. Inténtalo nuevamente.');
});

test('acceso inválido no revela si existe una cuenta; registro conserva validaciones conocidas', () => {
  for (const code of ['USER_NOT_FOUND', 'WRONG_PASSWORD', 'CredentialsSignin']) {
    expect(authErrorMessage(new AuthError('Detalle interno', code, 401, '/api/auth/callback/credentials', 'Acceso'))).toBe('No pudimos iniciar sesión. Revisa tu correo y contraseña.');
  }
  expect(authErrorMessage(new AuthError('Detalle interno', 'CallbackRouteError', 500, '/api/auth/callback/credentials', 'Acceso'))).toBe('No pudimos iniciar sesión. Inténtalo nuevamente.');
  expect(authErrorMessage(authError(http(400, { error: 'El formato del correo electrónico no es válido' }, '/api/auth/register'), 'Registro'))).toBe('Ingresa un correo electrónico válido.');
  expect(authErrorMessage(authError(http(400, { error: 'Nombre, correo, teléfono y contraseña son requeridos' }, '/api/auth/register'), 'Registro'))).toBe('Completa los campos obligatorios.');
  expect(authErrorMessage(authError(http(500, { error: 'RASP secret' }, '/api/auth/register'), 'Registro'))).toBe('No pudimos crear tu cuenta. Inténtalo nuevamente.');
});
