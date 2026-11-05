import type { Cita } from '@/modules/agenda/models/cita';
import { proximaCita, proximaCitaHorario } from '@/modules/inicio/viewmodels/proxima-cita';

const cita: Cita = {
  id: '1', servicioId: '2', servicioNombre: 'Manicura', total: '350.00',
  fecha: '2026-10-28T00:00:00.000Z', hora: '10:00', duracion: '1h',
  estado: 'CONFIRMADA', empleado: null, notas: null, comprobanteRecibido: false,
};

test('elige la cita vigente más cercana por día y hora, aunque la API no esté ordenada', () => {
  const now = new Date(2026, 9, 27, 12, 30).getTime();
  const nearest = { ...cita, id: 'nearest', fecha: '2026-10-27T00:00:00.000Z', hora: '16:00' };
  expect(proximaCita([
    cita,
    { ...cita, id: 'cancelled', fecha: '2026-10-27T00:00:00.000Z', hora: '13:00', estado: 'CANCELADA' },
    { ...cita, id: 'past', fecha: '2026-10-27T00:00:00.000Z', hora: '12:00' },
    nearest,
    { ...cita, id: 'pending', fecha: '2026-10-27T00:00:00.000Z', hora: '17:00', estado: 'PENDIENTE' },
  ], now)).toEqual(nearest);
  expect(proximaCitaHorario(nearest)).toMatch(/(16:00|4:00)/);
});

test('no presenta como próxima una cita cancelada, concluida o pasada', () => {
  const now = new Date(2026, 9, 27, 12, 30).getTime();
  expect(proximaCita([
    { ...cita, estado: 'CANCELADA' },
    { ...cita, estado: 'COMPLETADA' },
    { ...cita, fecha: '2026-10-26T00:00:00.000Z' },
    { ...cita, fecha: '2026-10-27T00:00:00.000Z', hora: '12:29' },
  ], now)).toBeUndefined();
  expect(proximaCita([], now)).toBeUndefined();
});
