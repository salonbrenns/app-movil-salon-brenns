import { useAuthSession } from '@/modules/auth/viewmodels/auth-session-provider';
import { useCatalogoViewModel } from '@/modules/catalogo/viewmodels/use-catalogo-view-model';
import { useAgendaViewModel } from '@/modules/agenda/viewmodels/use-agenda-view-model';
export function useInicioViewModel() {
 const { session, status } = useAuthSession();
 const catalogo = useCatalogoViewModel();
 const agenda = useAgendaViewModel();
 return { saludo: session?.user.name ? 'Hola, ' + session.user.name : 'Hola', autenticado: status === 'authenticated',
  catalogo, proximaCita: status === 'authenticated' ? agenda.citas[0] : undefined };
}
