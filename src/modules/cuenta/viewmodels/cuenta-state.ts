import type { Href } from 'expo-router';
import type { EstadoModulo } from '@/shared/models/view-state';
export type ModuloCuenta = 'autenticacion' | 'vacia' | 'cursos' | 'favoritos' | 'informacion';
export type DestinoCuenta = Readonly<{ seccion: string; modulo: ModuloCuenta; titulo: string; backHref?: Href }>;
export type EstadoCuenta = EstadoModulo<DestinoCuenta>;
export const PAGINAS_CUENTA: readonly DestinoCuenta[] = [
 { seccion: 'cerrar-sesion', modulo: 'autenticacion', titulo: 'Cerrar sesión', backHref: '/' },
 { seccion: 'crear-cuenta', modulo: 'autenticacion', titulo: 'Crear cuenta', backHref: '/autenticacion' },
 { seccion: 'recuperar-contrasena', modulo: 'informacion', titulo: 'Recuperar contraseña', backHref: '/autenticacion' },
 { seccion: 'nueva-contrasena', modulo: 'informacion', titulo: 'Nueva contraseña', backHref: '/autenticacion' },
 { seccion: 'verificar-email', modulo: 'autenticacion', titulo: 'Verificar correo', backHref: '/autenticacion' },
 { seccion: 'cursos', modulo: 'cursos', titulo: 'Mis cursos', backHref: '/perfil' },
 { seccion: 'favoritos', modulo: 'favoritos', titulo: 'Mis favoritos', backHref: '/perfil' },
 { seccion: 'compras', modulo: 'informacion', titulo: 'Mis compras', backHref: '/perfil' },
 { seccion: 'direcciones', modulo: 'informacion', titulo: 'Direcciones', backHref: '/perfil' },
 { seccion: 'editar-perfil', modulo: 'informacion', titulo: 'Editar perfil', backHref: '/perfil' },
 { seccion: 'configuracion', modulo: 'informacion', titulo: 'Configuración', backHref: '/perfil' },
 { seccion: 'apariencia', modulo: 'informacion', titulo: 'Apariencia', backHref: '/cuenta/configuracion' },
 { seccion: 'seguridad', modulo: 'informacion', titulo: 'Seguridad', backHref: '/cuenta/configuracion' },
 { seccion: 'eliminar-cuenta', modulo: 'informacion', titulo: 'Eliminar cuenta', backHref: '/cuenta/seguridad' },
 { seccion: 'ayuda', modulo: 'informacion', titulo: 'Ayuda', backHref: '/perfil' },
 { seccion: 'legal', modulo: 'informacion', titulo: 'Información legal', backHref: '/perfil' },
 { seccion: 'privacidad', modulo: 'informacion', titulo: 'Aviso de privacidad', backHref: '/cuenta/legal' },
 { seccion: 'terminos', modulo: 'informacion', titulo: 'Términos y condiciones', backHref: '/cuenta/legal' },
 { seccion: 'cancelaciones', modulo: 'informacion', titulo: 'Cancelaciones y reembolsos', backHref: '/cuenta/legal' },
 { seccion: 'acerca', modulo: 'informacion', titulo: 'Acerca de la aplicación', backHref: '/perfil' },
];
