import { saludoDeSesion } from '@/modules/inicio/viewmodels/saludo';

test.each([
  ['  BENILDE GARCÍA  ', 'Hola, Benilde'],
  ['maría fernández', 'Hola, María'],
  ['ANA-LUCÍA RUIZ', 'Hola, Ana-Lucía'],
  ['', 'Hola'],
  [null, 'Hola'],
])('el saludo toma solamente el primer nombre de la sesión', (name, expected) => {
  expect(saludoDeSesion(name)).toBe(expected);
});
