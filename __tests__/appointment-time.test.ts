import { appointmentTime } from '@/modules/agenda/viewmodels/appointment-time';

test('una cita del día cambia de Próximas a Historial según su hora local', () => {
  const now = new Date(2026, 10, 10, 12, 0).getTime();
  expect(appointmentTime({ fecha: '2026-11-10T00:00:00.000Z', hora: '10:30' })).toBeLessThan(now);
  expect(appointmentTime({ fecha: '2026-11-10T00:00:00.000Z', hora: '13:00' })).toBeGreaterThan(now);
});
