import type { Href } from 'expo-router';

export const NavigationSections = {
  authentication: { name: 'autenticacion', href: '/autenticacion', title: 'Autenticación' },
  courses: { name: 'cursos', href: '/cursos', title: 'Cursos' },
  catalog: { name: 'catalogo', href: '/catalogo', title: 'Catálogo' },
  cart: { name: 'carrito', href: '/carrito', title: 'Carrito' },
  services: { name: 'servicios', href: '/servicios', title: 'Servicios' },
  schedule: { name: 'agenda', href: '/agenda', title: 'Agenda' },
  profile: { name: 'perfil', href: '/perfil', title: 'Perfil' },
} as const satisfies Record<string, { name: string; href: Href; title: string }>;

export const BottomNavigationItems = [
 { href: '/', label: 'Inicio', icon: 'home' },
 { href: '/catalogo', label: 'Catálogo', icon: 'catalog' },
 { href: '/agenda', label: 'Agenda', icon: 'agenda' },
 { href: '/carrito', label: 'Carrito', icon: 'cart' },
 { href: '/perfil', label: 'Perfil', icon: 'profile' },
] as const satisfies readonly { href: Href; label: string; icon: string }[];
export function showsBottomNavigation(pathname: string) {
 if (['/autenticacion', '/verificar-email', '/cuenta/crear-cuenta', '/cuenta/verificar-email'].includes(pathname)) return false;
 return pathname === '/' || Object.values(NavigationSections).some(section => section.href === pathname) || pathname.startsWith('/cuenta/');
}
