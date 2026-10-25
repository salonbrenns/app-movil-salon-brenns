const protectedPaths = ['/cuenta/cursos', '/cuenta/compras', '/cuenta/favoritos', '/cuenta/direcciones', '/cuenta/editar-perfil', '/cuenta/cerrar-sesion', '/cuenta/configuracion', '/cuenta/apariencia', '/cuenta/seguridad', '/cuenta/eliminar-cuenta'];
export function isProtectedPath(pathname: string): boolean { return protectedPaths.some(path => pathname === path || pathname.startsWith(path + '/')); }
export function loginDestination(value: string | string[] | undefined): string {
 const fallback = '/';
 if (typeof value !== 'string' || /[\\\s#]/.test(value)) return fallback;
 try {
  const url = new URL(value, 'https://app.invalid');
  const existing = ['/', '/catalogo', '/cursos', '/servicios', '/agenda', '/perfil', ...protectedPaths].includes(url.pathname);
  return value.startsWith('/') && value.split('?')[0] === url.pathname && url.origin === 'https://app.invalid' && existing ? url.pathname + url.search : fallback;
 } catch { return fallback; }
}
