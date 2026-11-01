import { useAuthSession } from '@/modules/auth/viewmodels/auth-session-provider';
import { useAgendaViewModel } from '@/modules/agenda/viewmodels/use-agenda-view-model';
import { proximaCita } from './proxima-cita';
import { saludoDeSesion } from './saludo';

export function useInicioViewModel() {
 const { session, status } = useAuthSession();
 const agenda = useAgendaViewModel();
 return { saludo: saludoDeSesion(status === 'authenticated' ? session?.user.name : null),
  status, agenda, proximaCita: status === 'authenticated' ? proximaCita(agenda.datos ?? [], agenda.now) : undefined };
}
