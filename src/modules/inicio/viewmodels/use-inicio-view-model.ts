import { useAuthSession } from '@/modules/auth/viewmodels/auth-session-provider';
export function useInicioViewModel() {
 const { session, status } = useAuthSession();
 return { saludo: session?.user.name ? 'Hola, ' + session.user.name : 'Hola', autenticado: status === 'authenticated',
  categorias: [{ title: 'Cursos', icon: 'course' as const, href: '/catalogo?categoria=Cursos' as const }] };
}
