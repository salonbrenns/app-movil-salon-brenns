import { HttpError } from '@/services/api';
import { AdapterError, ModelNotFoundError } from './adapter-error';
import { InputError } from './input-error';
import { SessionDataError } from './session-data-error';

export type UserErrorKind = 'sesion' | 'permiso' | 'validacion' | 'servidor' | 'respuesta' | 'conexion';
export class UserFacingError extends Error { readonly name = 'UserFacingError'; }
export type ErrorContext =
  | 'general' | 'cursos' | 'mis-cursos' | 'servicios' | 'productos' | 'horarios' | 'agenda' | 'compras' | 'carrito'
  | 'perfil' | 'favoritos' | 'cambiar-favorito' | 'inscripcion' | 'reserva' | 'cancelar-cita' | 'pedido'
  | 'agregar-carrito' | 'cantidad-carrito' | 'eliminar-carrito' | 'seleccionar-comprobante' | 'subir-comprobante'
  | 'cambiar-password' | 'editar-perfil' | 'recuperar-password';

const fallback: Record<ErrorContext, string> = {
  general: 'No pudimos completar la operación. Inténtalo nuevamente.',
  cursos: 'No pudimos cargar los cursos. Inténtalo nuevamente.',
  'mis-cursos': 'No pudimos cargar tus cursos. Inténtalo nuevamente.',
  servicios: 'No pudimos cargar los servicios. Inténtalo nuevamente.',
  productos: 'No pudimos cargar los productos. Inténtalo nuevamente.',
  horarios: 'No pudimos cargar los horarios disponibles. Inténtalo nuevamente.',
  agenda: 'No pudimos cargar tus citas. Inténtalo nuevamente.',
  compras: 'No pudimos cargar tus compras. Inténtalo nuevamente.',
  carrito: 'No pudimos cargar tu carrito. Inténtalo nuevamente.',
  perfil: 'No pudimos cargar tu perfil. Inténtalo nuevamente.',
  favoritos: 'No pudimos cargar tus favoritos. Inténtalo nuevamente.',
  'cambiar-favorito': 'No pudimos actualizar tus favoritos. Inténtalo nuevamente.',
  inscripcion: 'No pudimos completar tu inscripción. Inténtalo nuevamente.',
  reserva: 'No pudimos confirmar tu cita. Inténtalo nuevamente.',
  'cancelar-cita': 'No pudimos cancelar tu cita. Inténtalo nuevamente.',
  pedido: 'No pudimos completar tu pedido. Inténtalo nuevamente.',
  'agregar-carrito': 'No pudimos agregar el producto al carrito. Inténtalo nuevamente.',
  'cantidad-carrito': 'No pudimos actualizar la cantidad. Inténtalo nuevamente.',
  'eliminar-carrito': 'No pudimos eliminar el producto del carrito. Inténtalo nuevamente.',
  'seleccionar-comprobante': 'No pudimos abrir el archivo seleccionado. Inténtalo nuevamente.',
  'subir-comprobante': 'No pudimos subir tu comprobante. Inténtalo nuevamente.',
  'cambiar-password': 'No pudimos cambiar tu contraseña. Inténtalo nuevamente.',
  'editar-perfil': 'No pudimos actualizar tu perfil. Inténtalo nuevamente.',
  'recuperar-password': 'No pudimos completar la recuperación. Inténtalo nuevamente.',
};

function contextForPath(path: string): ErrorContext {
  if (/^\/api\/cursos\/[^/]+\/inscribir$/.test(path)) return 'inscripcion';
  if (path === '/api/mis-cursos' || path === '/api/cursos') return 'cursos';
  if (path.startsWith('/api/servicios')) return 'servicios';
  if (path.startsWith('/api/productos')) return 'productos';
  if (path.startsWith('/api/horarios')) return 'horarios';
  if (path.startsWith('/api/citas')) return path.endsWith('/comprobante') ? 'subir-comprobante' : 'agenda';
  if (path.startsWith('/api/pedidos')) return path.endsWith('/comprobante') ? 'subir-comprobante' : 'compras';
  if (path.startsWith('/api/pagos-curso')) return 'subir-comprobante';
  if (path.startsWith('/api/carrito')) return 'carrito';
  if (path.startsWith('/api/favoritos')) return 'favoritos';
  if (path.startsWith('/api/usuario/perfil')) return 'perfil';
  return 'general';
}

function knownBackendMessage(path: string, status: number, value: unknown): string | null {
  if (typeof value !== 'string') return null;
  if (path === '/api/usuario/password' && status === 400) {
    if (value === 'La contraseña actual es incorrecta') return 'La contraseña actual es incorrecta. Inténtalo nuevamente.';
    if (value === 'La contraseña debe tener mínimo 8 caracteres') return 'La nueva contraseña debe tener al menos 8 caracteres.';
    if (value === 'Faltan datos') return 'Completa la contraseña actual y la nueva contraseña.';
  }
  if (/^\/api\/cursos\/[^/]+\/inscribir$/.test(path) && status === 409) {
    if (value === 'Ya estás inscrito en este curso') return 'Ya tienes una inscripción registrada para este curso.';
    if (value === 'El cupo del curso está completo') return 'Este curso ya no tiene lugares disponibles.';
  }
  if (path === '/api/citas' && status === 409) {
    if (value === 'Esa hora no está disponible' || value === 'Esa hora ya esta ocupada') return 'Ese horario ya no está disponible. Selecciona otro.';
    if (value === 'El salón no atiende ese día') return 'El salón no atiende ese día. Selecciona otra fecha.';
  }
  if (path === '/api/citas' && status === 400) {
    if (value === 'No puedes agendar en una fecha u hora pasada') return 'Selecciona una fecha y hora futuras.';
    if (value === 'Faltan datos requeridos') return 'Completa los datos de tu cita.';
    if (value === 'La cita ya no puede cancelarse') return 'Esta cita ya no se puede cancelar.';
    if (value === 'Solo puedes cancelar con más de 24 horas de anticipación') return 'Solo puedes cancelar con más de 24 horas de anticipación.';
    if (value === 'Tienes demasiadas citas activas. Cancela alguna antes de agendar una nueva.') return value;
  }
  if (path === '/api/pedidos' && status === 409 && value.startsWith('Stock insuficiente para "')) return 'No hay suficientes unidades de uno de los productos de tu carrito.';
  if (path === '/api/pedidos' && status === 400 && value === 'El carrito está vacío') return 'Tu carrito está vacío.';
  if (path === '/api/carrito' && status === 404 && value === 'Variante no disponible') return 'Este producto ya no está disponible.';
  if (path.endsWith('/comprobante')) {
    if (status === 415 && value.startsWith('Tipo de archivo no permitido.')) return 'Este formato de archivo no es compatible.';
    if (status === 413 && value.startsWith('El archivo supera el límite de ')) return 'El archivo supera el tamaño permitido.';
    if (status === 400 && value === 'No se recibió archivo') return 'Selecciona un comprobante para continuar.';
    if (status === 409 && value.startsWith('Ya subiste un comprobante')) return 'Ya enviaste un comprobante para este pago.';
    if (status === 400 && value.startsWith('No se puede subir comprobante')) return 'Este pago no permite enviar otro comprobante.';
  }
  return null;
}

const localMessages: Record<string, string> = {
  'Ya estás inscrito en este curso. Consulta su estado en Mis cursos.': 'Ya tienes una inscripción registrada para este curso.',
  'Ya existe una inscripción anterior para este curso. Consulta su estado en Mis cursos.': 'Ya existe una inscripción anterior para este curso. Consulta su estado en Mis cursos.',
  'La disponibilidad cambió. Selecciona otra fecha u hora antes de confirmar.': 'Ese horario ya no está disponible. Selecciona otro.',
  'El comprobante no puede superar 10 MB.': 'El archivo supera el tamaño permitido.',
  'El archivo seleccionado está vacío. Elige otro comprobante.': 'El archivo está vacío. Selecciona otro comprobante.',
  'Selecciona un archivo JPG, PNG, WEBP, GIF o PDF.': 'Este formato de archivo no es compatible.',
  'No se pudo abrir el archivo seleccionado en el dispositivo. Vuelve a seleccionarlo.': 'No pudimos abrir el archivo seleccionado. Inténtalo nuevamente.',
  'No se pudo preparar el archivo seleccionado en el dispositivo. Vuelve a seleccionarlo.': 'No pudimos abrir el archivo seleccionado. Inténtalo nuevamente.',
  'El archivo preparado ya no está disponible. Selecciónalo de nuevo.': 'Selecciona de nuevo el comprobante.',
  'El nombre del archivo no es válido.': 'Selecciona otro archivo para continuar.',
  'Primero registra el pedido.': 'Primero confirma el pedido.',
  'Primero registra la cita.': 'Primero confirma la cita.',
  'La confirmación del pedido ya está en curso.': 'Tu pedido ya se está confirmando. Espera un momento.',
  'Este pago no admite otro comprobante. Actualiza su estado.': 'Este pago no permite enviar otro comprobante.',
};

export function userError(error: unknown, context?: ErrorContext): { kind: UserErrorKind; message: string } {
  if (error instanceof UserFacingError) return { kind: 'validacion', message: error.message };
  const path = error instanceof HttpError ? error.path.split('?')[0] : '';
  const area = context ?? contextForPath(path);
  if (error instanceof HttpError) {
    const kind: UserErrorKind = error.status === 401 ? 'sesion' : error.status === 403 ? 'permiso'
      : error.status >= 500 ? 'servidor' : 'validacion';
    const body = typeof error.body === 'object' && error.body !== null && 'error' in error.body ? error.body.error : null;
    const known = knownBackendMessage(path, error.status, body);
    if (known) return { kind, message: known };
    if (error.status === 408) return { kind: 'conexion', message: 'La operación está tardando demasiado. Inténtalo nuevamente.' };
    if (error.status === 429) return { kind: 'validacion', message: 'Demasiados intentos. Inténtalo nuevamente en unos minutos.' };
    if (kind === 'sesion') return { kind, message: 'Tu sesión ha expirado. Inicia sesión nuevamente.' };
    if (kind === 'permiso') return { kind, message: 'No tienes permiso para realizar esta acción.' };
    if (error.status === 404) return { kind, message: area === 'productos' ? 'Este producto ya no está disponible.' : 'La información solicitada ya no está disponible.' };
    return { kind, message: fallback[area] };
  }
  if (error instanceof ModelNotFoundError) return { kind: 'respuesta', message: error.entity.toLowerCase() === 'producto'
    ? 'Este producto ya no está disponible.' : 'La información solicitada ya no está disponible.' };
  if (error instanceof AdapterError) return { kind: 'respuesta', message: error.path.startsWith('config-sitio.')
    ? 'Los datos bancarios aún no están disponibles. Inténtalo más tarde.' : fallback[area] };
  if (error instanceof SessionDataError) return { kind: 'sesion', message: 'Tu sesión ha expirado. Inicia sesión nuevamente.' };
  if (error instanceof InputError) return { kind: 'validacion', message: localMessages[error.message] ?? fallback[area] };
  if (error instanceof TypeError && /fetch failed|failed to fetch|network request failed|networkerror|load failed|unable to resolve host/i.test(error.message)) {
    return { kind: 'conexion', message: area === 'pedido'
      ? 'No pudimos confirmar el estado de tu pedido. Revisa Mis compras antes de intentarlo nuevamente.'
      : 'No pudimos conectarnos. Revisa tu conexión e inténtalo nuevamente.' };
  }
  if (error instanceof Error && error.name === 'TimeoutError') return { kind: 'conexion', message: 'La operación está tardando demasiado. Inténtalo nuevamente.' };
  if (error instanceof Error && localMessages[error.message]) return { kind: 'validacion', message: localMessages[error.message] };
  return { kind: 'respuesta', message: fallback[area] };
}
