const assert = require('node:assert/strict');
const { test } = require('node:test');
const { AdapterError } = require('@/shared/adapters/adapter-error');
const { adaptCursoDto, adaptCursosRespuesta } = require('@/modules/cursos/adapters/cursos-adapter');
const cursoDto = {
  id: 7,
  titulo: 'Curso de especialización',
  descripcion: null,
  precio_total: '1200.00',
  duracion_horas: 20,
  nivel: null,
  fecha_inicio: '2026-09-30T00:00:00.000Z',
  fecha_fin: null,
};
const cursoModel = {
  imagen: null, cupoMaximo: null, inscritos: null,
  id: '7',
  nombre: 'Curso de especialización',
  descripcion: null,
  precio: '1200.00',
  duracionHoras: 20,
  nivel: null,
  fechaInicio: '2026-09-30',
  fechaFin: null,
};

test('courses adapt the verified title, exact Decimal amount and nullable calendar fields', () => {
  assert.deepEqual(adaptCursoDto(cursoDto), { ...cursoModel, imagen: null, cupoMaximo: null, inscritos: null });
  assert.deepEqual(adaptCursosRespuesta({ cursos: [cursoDto] }), [{ ...cursoModel, imagen: null, cupoMaximo: null, inscritos: null }]);
  const optional = adaptCursoDto({ ...cursoDto, descripcion: null, duracion_horas: null, nivel: null, fecha_inicio: null, fecha_fin: null });
  assert.equal(optional.duracionHoras, null);
  assert.equal(optional.fechaInicio, null);
  assert.equal(optional.fechaFin, null);
  assert.equal(Object.hasOwn(optional, 'instructor'), false);
  assert.equal(Object.hasOwn(optional, 'modalidad'), false);
  assert.equal(adaptCursoDto({ ...cursoDto, precio_total: '12345678901234567890.99' }).precio, '12345678901234567890.99');
});


test('courses reject invalid consumed fields rather than supplying preview/default values', () => {
  for (const patch of [
    { id: '7' }, { id: 0 }, { titulo: null }, { descripcion: undefined },
    { precio_total: 1200 }, { precio_total: 'gratis' },
    { duracion_horas: 1.5 }, { nivel: false },
    { fecha_inicio: '2023-02-29' }, { fecha_fin: '2026-09-30T23:00:00.000Z' },
  ]) assert.throws(() => adaptCursoDto({ ...cursoDto, ...patch }), AdapterError);
});
