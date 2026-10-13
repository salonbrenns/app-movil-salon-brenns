const assert = require('node:assert/strict');
const { test } = require('node:test');
const { FetchHttpClient, HttpError } = require('@/services/api');
const { AdapterError } = require('@/shared/adapters/adapter-error');
const { SessionResource } = require('@/shared/viewmodels/session-resource');
const { transferenciaResponse } = require('@/shared/adapters/transferencia-adapter');
const { bancoAprobado } = require('@/config/transferencia-aprobada');
const { HttpTransferenciaService } = require('@/shared/services/transferencia-service');
const { HttpInscripcionesService } = require('@/modules/cursos/services/inscripciones-service');
const { adaptCursoDto } = require('@/modules/cursos/adapters/cursos-adapter');
const { imageUri } = require('@/shared/viewmodels/media-state');
function fixture(handler) {
  const requests = [];
  const http = new FetchHttpClient(() => 'https://example.invalid', async (url, options) => {
    const request = { url: new URL(url), options, body: options.body ? JSON.parse(options.body) : null };
    requests.push(request);
    const value = await handler(request);
    return value instanceof Response ? value : new Response(JSON.stringify(value));
  });
  return { http, requests };
}
function deferred() { let resolve; const promise = new Promise(done => { resolve = done; }); return { promise, resolve }; }


test('bank data uses the explicitly approved source only when API keys are absent, and never mixes accounts', async () => {
  const approved = transferenciaResponse({});
  assert.deepEqual(approved.banco, bancoAprobado); assert.equal(approved.fuente, 'aprobada'); assert.equal(approved.anticipoPorcentaje, 50);
  const api = transferenciaResponse({ banco_titular: 'Titular confirmado por API', banco_banco: 'Banco publicado', banco_clabe: '111111111111111111', anticipo_porcentaje: '25' });
  assert.equal(api.fuente, 'api'); assert.equal(api.banco.cuenta, null); assert.equal(api.banco.celular, null); assert.equal(api.anticipoPorcentaje, 25);
  assert.throws(() => transferenciaResponse({ banco_banco: 'Configuración incompleta' }), AdapterError);
  assert.throws(() => transferenciaResponse({ anticipo_porcentaje: '200' }), AdapterError);
  const f = fixture(() => ({})); await new HttpTransferenciaService(f.http).obtener();
  assert.equal(f.requests[0].url.pathname, '/api/config-sitio');
});

test('enrollment retains the server IDs and full amount, suppresses duplicate submission and refreshes only after confirmation', async () => {
  const pending = deferred(), f = fixture(() => pending.promise);
  const service = new HttpInscripcionesService(f.http);
  let reads = 0, receipt = null;
  const vm = new SessionResource(async () => { reads++; return []; }, true);
  await vm.cargar();
  const first = vm.ejecutar(() => service.inscribir('5'), 'Pago pendiente', value => { receipt = value; });
  assert.equal(await vm.ejecutar(() => service.inscribir('5'), 'Duplicate'), false);
  pending.resolve({ success: true, inscripcionId: 6, pagoId: 7, monto: 250, metodoPago: 'TRANSFERENCIA', tipoPago: 'COMPLETO' });
  assert.equal(await first, true); assert.deepEqual(receipt, { inscripcionId: '6', pagoId: '7', monto: '250' });
  assert.equal(reads, 2); assert.equal(f.requests.length, 1); assert.equal(f.requests[0].options.body, undefined);
});

test('enrollment duplicate/capacity/session errors preserve the server error and do not produce receipts', async () => {
  for (const [status, error] of [[409, 'Ya estás inscrito'], [409, 'El cupo del curso está completo'], [401, 'No autorizado']]) {
    const f = fixture(() => new Response(JSON.stringify({ error }), { status }));
    await assert.rejects(new HttpInscripcionesService(f.http).inscribir('5'), e => e instanceof HttpError && e.status === status && e.body.error === error);
  }
});

test('course adapter consumes real JSON images and capacity, leaving absent values neutral', () => {
  const dto = { id: 5, titulo: 'Publicado', descripcion: null, precio_total: '250.00', duracion_horas: null, nivel: null, fecha_inicio: null, fecha_fin: null,
    imagenes: ['https://example.invalid/real.jpg'], cupo_maximo: 10, inscritos: 10 };
  const course = adaptCursoDto(dto);
  assert.equal(course.imagen, dto.imagenes[0]); assert.equal(course.inscritos, course.cupoMaximo);
  assert.equal(adaptCursoDto({ ...dto, imagenes: null }).imagen, null);
  assert.throws(() => adaptCursoDto({ ...dto, inscritos: -1 }), AdapterError);
});

test('image source accepts real HTTP images and rejects absence, unsafe and malformed URLs without examples', () => {
  for (const value of [undefined, null, '', 'bad url', 'javascript:alert(1)', 'file:///photo.jpg', {}]) assert.equal(imageUri(value), undefined);
  assert.equal(imageUri(['https://example.invalid/real.jpg']), 'https://example.invalid/real.jpg');
});
