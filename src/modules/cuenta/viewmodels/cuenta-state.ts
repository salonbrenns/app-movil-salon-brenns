import type { Href } from 'expo-router';
import type { EstadoModulo } from '@/shared/models/view-state';
export type ModuloCuenta = 'autenticacion' | 'vacia' | 'cursos';
export type DestinoCuenta = Readonly<{ seccion: string; modulo: ModuloCuenta; titulo: string; backHref?: Href }>;
export type EstadoCuenta = EstadoModulo<DestinoCuenta>;
export const PAGINAS_CUENTA: readonly DestinoCuenta[] = [
 { seccion: 'cerrar-sesion', modulo: 'autenticacion', titulo: 'Cerrar sesión', backHref: '/' },
 { seccion: 'crear-cuenta', modulo: 'autenticacion', titulo: 'Crear cuenta', backHref: '/autenticacion' },
 { seccion: 'verificar-email', modulo: 'autenticacion', titulo: 'Verificar correo', backHref: '/autenticacion' },
 { seccion: 'cursos', modulo: 'cursos', titulo: 'Mis cursos', backHref: '/catalogo' },
];
