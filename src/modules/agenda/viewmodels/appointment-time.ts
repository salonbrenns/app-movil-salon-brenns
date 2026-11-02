import type { Cita } from '../models/cita';

export function appointmentTime(cita: Pick<Cita, 'fecha' | 'hora'>): number {
  const [year, month, day] = cita.fecha.slice(0, 10).split('-').map(Number);
  const [hour, minute] = cita.hora.split(':').map(Number);
  return new Date(year, month - 1, day, hour, minute).getTime();
}
