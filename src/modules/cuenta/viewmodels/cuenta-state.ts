import type { Href } from 'expo-router';
import type { EstadoModulo } from '@/shared/models/view-state';
export type ModuloCuenta = 'autenticacion' | 'vacia';
export type DestinoCuenta = Readonly<{ seccion: string; modulo: ModuloCuenta; titulo: string; backHref?: Href }>;
export type EstadoCuenta = EstadoModulo<DestinoCuenta>;
export const PAGINAS_CUENTA: readonly DestinoCuenta[] = [
 { seccion: 'cerrar-sesion', modulo: 'autenticacion', titulo: 'Cerrar sesión', backHref: '/' },


];
