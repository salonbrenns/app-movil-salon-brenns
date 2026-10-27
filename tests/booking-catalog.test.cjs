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
const { carritoResponse } = require('@/modules/carrito/adapters/carrito-adapter');
const { favoritosResponse } = require('@/modules/favoritos/adapters/favoritos-adapter');
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

test('cart keeps the valid product image from backend JSON, including arrays', () => {
  const item = { id: 1, variante_id: 2, tono: null, presentacion: null, precio_venta: '25.00', cantidad: 1, stock: 3,
    producto: { nombre: 'Producto', imagen: ['javascript:alert(1)', 'https://example.invalid/producto.jpg'] } };
  assert.equal(carritoResponse([item]).items[0].imagen, 'https://example.invalid/producto.jpg');
  assert.equal(carritoResponse([{ ...item, producto: { ...item.producto, imagen: null } }]).items[0].imagen, null);
  assert.equal(carritoResponse([{ ...item, producto: { ...item.producto, imagen: 'file:///invalid.jpg' } }]).items[0].imagen, null);
});

test('favorites keep product, service and course images and reject invalid URLs', () => {
  const product = { id: 2, nombre: 'Producto', precio_min: '25.00', imagen: ['https://example.invalid/p.jpg'] };
  const service = { id: 3, nombre: 'Servicio', precio_min: 50, imagen: 'https://example.invalid/s.jpg' };
  const course = { id: 4, titulo: 'Curso', precio_total: '100.00', imagenes: ['bad', 'https://example.invalid/c.jpg'] };
  assert.equal(favoritosResponse([{ id: 1, producto: product }], 'Productos')[0].imagen, product.imagen[0]);
  assert.equal(favoritosResponse([{ id: 1, servicio: service }], 'Servicios')[0].imagen, service.imagen);
  assert.equal(favoritosResponse({ cursos: [course] }, 'Cursos')[0].imagen, course.imagenes[1]);
  assert.equal(favoritosResponse([{ id: 1, producto: { ...product, imagen: null } }], 'Productos')[0].imagen, null);
  assert.equal(favoritosResponse({ cursos: [{ ...course, imagenes: ['file:///bad.jpg'] }] }, 'Cursos')[0].imagen, null);
});


test('bank data uses prior approved values only when the API omits every bank key', async () => {
  assert.deepEqual(transferenciaResponse({}).banco, bancoAprobado);
  assert.equal(transferenciaResponse({}).fuente, 'aprobada');
  const api = transferenciaResponse({ banco_titular: 'Titular confirmado por API', banco_banco: 'Banco publicado', banco_cuenta: '1234567890', banco_clabe: '111111111111111111', anticipo_porcentaje: '25' });
  assert.equal(api.fuente, 'api'); assert.equal(api.banco.cuenta, '1234567890'); assert.equal(api.banco.celular, null); assert.equal(api.anticipoPorcentaje, 25);
  assert.throws(() => transferenciaResponse({ banco_banco: 'Configuración incompleta' }), AdapterError);
  assert.throws(() => transferenciaResponse({ anticipo_porcentaje: '200' }), AdapterError);
  const f = fixture(() => ({ banco_titular: 'Titular', banco_banco: 'Banco', banco_cuenta: '1234567890', banco_clabe: '111111111111111111' })); await new HttpTransferenciaService(f.http).obtener();
  assert.equal(f.requests[0].url.pathname, '/api/config-sitio');
});

test('enrollment retains the server IDs and full amount, suppresses duplicate submission and refreshes only after confirmation', async () => {
  const pending = deferred(), f = fixture((request) => request.url.pathname.endsWith('/estado') ? { inscrito: false } : request.options.method === 'GET' ? { cursos: [] } : pending.promise);
  const service = new HttpInscripcionesService(f.http);
  let reads = 0, receipt = null;
  const vm = new SessionResource(async () => { reads++; return []; }, true);
  await vm.cargar();
  const first = vm.ejecutar(() => service.inscribir('5'), 'Pago pendiente', value => { receipt = value; });
  assert.equal(await vm.ejecutar(() => service.inscribir('5'), 'Duplicate'), false);
  pending.resolve({ success: true, inscripcionId: 6, pagoId: 7, monto: 250, metodoPago: 'TRANSFERENCIA', tipoPago: 'COMPLETO' });
  assert.equal(await first, true); assert.deepEqual(receipt, { inscripcionId: '6', pagoId: '7', monto: '250' });
  assert.equal(reads, 2); assert.equal(f.requests.length, 3); assert.equal(f.requests[0].url.pathname, '/api/cursos/5/estado'); assert.equal(f.requests[1].url.pathname, '/api/mis-cursos'); assert.equal(f.requests[2].options.body, undefined);
});

test('enrollment duplicate/capacity/session errors preserve the server error and do not produce receipts', async () => {
  for (const [status, error] of [[409, 'Ya estás inscrito'], [409, 'El cupo del curso está completo'], [401, 'No autorizado']]) {
    const f = fixture((request) => request.url.pathname.endsWith('/estado') ? { inscrito: false } : request.options.method === 'GET' ? { cursos: [] } : new Response(JSON.stringify({ error }), { status }));
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
