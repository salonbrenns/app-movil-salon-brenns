import type { Cita } from '@/modules/agenda/models/cita';
import { localCalendarDay } from '@/shared/viewmodels/calendar';

function calendarDay(cita: Cita): string {
  const isoDay = /^\d{4}-\d{2}-\d{2}/.exec(cita.fecha)?.[0];
  return isoDay ?? localCalendarDay(new Date(cita.fecha));
}

export function proximaCita(citas: readonly Cita[], now: number): Cita | undefined {
  const current = new Date(now);
  const currentSlot = `${localCalendarDay(current)}T${String(current.getHours()).padStart(2, '0')}:${String(current.getMinutes()).padStart(2, '0')}`;
  let nearest: Cita | undefined;
  let nearestSlot = '';

  for (const cita of citas) {
    if (cita.estado !== 'PENDIENTE' && cita.estado !== 'CONFIRMADA') continue;
    const slot = `${calendarDay(cita)}T${cita.hora}`;
    if (slot < currentSlot) continue;
    if (!nearest || slot < nearestSlot) {
      nearest = cita;
      nearestSlot = slot;
    }
  }

  return nearest;
}

export function proximaCitaHorario(cita: Cita): string {
  const [year, month, day] = calendarDay(cita).split('-').map(Number);
  const [hour, minute] = cita.hora.split(':').map(Number);
  const date = new Date(year, month - 1, day, hour, minute);
  const formattedDay = date.toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' });
  const formattedHour = date.toLocaleTimeString('es-MX', { hour: 'numeric', minute: '2-digit' });
  return `${formattedDay} · ${formattedHour}`;
}
