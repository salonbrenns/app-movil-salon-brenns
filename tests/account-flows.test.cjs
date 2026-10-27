const assert = require('node:assert/strict');
const { test } = require('node:test');
const { FetchHttpClient, HttpError, setAuthRequestHooks } = require('@/services/api');
const { HttpInscripcionesService } = require('@/modules/cursos/services/inscripciones-service');
const { SessionResource, operationError } = require('@/shared/viewmodels/session-resource');
const { SessionTransitions } = require('@/modules/auth/viewmodels/session-transitions');
function fixture(handler) {
  const requests = [];
  const http = new FetchHttpClient(() => 'https://example.invalid', async (url, options) => {
    const path = new URL(url).pathname;
    const request = { path, query: new URL(url).search, options, body: options.body ? JSON.parse(options.body) : null };
    requests.push(request);
    const response = await handler(request);
    return response instanceof Response ? response : new Response(JSON.stringify(response), { headers: { 'Content-Type': 'application/json' } });
  });
  return { http, requests };
}
function deferred() { let resolve; const promise = new Promise((done) => { resolve = done; }); return { promise, resolve }; }


test('enrollment confirms IDs and pending transfer contract, and empty Mis cursos is real', async () => {
  const f = fixture((r) => r.path.endsWith('/estado') ? { inscrito: false } : r.options.method === 'GET' ? { cursos: [] } : { success: true, inscripcionId: 7, pagoId: 9, monto: 250, tipoPago: 'COMPLETO', metodoPago: 'TRANSFERENCIA' });
  const service = new HttpInscripcionesService(f.http);
  assert.deepEqual(await service.listar(), []);
  assert.deepEqual(await service.inscribir('15'), { inscripcionId: '7', pagoId: '9', monto: '250' });
  assert.equal(f.requests[1].path, '/api/cursos/15/estado');
  assert.equal(f.requests[2].path, '/api/mis-cursos');
  assert.equal(f.requests[3].path, '/api/cursos/15/inscribir');
  assert.equal(f.requests[3].options.body, undefined);
  const denied = new HttpInscripcionesService(fixture(() => new Response('{"error":"Solo clientes"}', { status: 403 })).http);
  await assert.rejects(denied.inscribir('15'), (error) => operationError(error).kind === 'permiso');
});


test('errors distinguish session, permission, input conflict and server failure without fake success', async () => {
  for (const [status, kind] of [[401, 'sesion'], [403, 'permiso'], [409, 'validacion'], [500, 'servidor']]) {
    const error = new HttpError(status, { error: 'Motivo específico' }, '/api/mis-cursos');
    assert.equal(operationError(error).kind, kind);
    assert.ok(operationError(error).message.includes('/api/mis-cursos; HTTP ' + status));
    const vm = new SessionResource(async () => [], true);
    await vm.cargar();
    assert.equal(await vm.ejecutar(async () => { throw error; }, 'Success'), false);
    assert.equal(vm.getSnapshot().mensaje, null);
    assert.equal(vm.getSnapshot().tipoError, kind);
  }
});


test('resource cancels old account data, ignores late results and loads the next account independently', async () => {
  const pending = deferred();
  const old = new SessionResource(() => pending.promise, true, 'A:1');
  const first = old.cargar(); old.cancel();
  const current = new SessionResource(async () => ({ nombre: 'B' }), true, 'B:2');
  await current.cargar(); pending.resolve({ nombre: 'A' }); await first;
  assert.equal(old.getSnapshot().datos, null);
  assert.equal(current.getSnapshot().datos.nombre, 'B');
  current.cancel(); assert.equal(current.getSnapshot().datos, null);
});

test('anonymous home cannot load private agenda data through the session resource', async () => {
  let requests = 0;
  const agenda = new SessionResource(async () => { requests++; return [{ id: '1' }]; }, false, 'anonymous:0');
  await agenda.cargar();
  assert.equal(requests, 0);
  assert.equal(agenda.getSnapshot().datos, null);
  assert.equal(await agenda.ejecutar(async () => { requests++; }, 'Cita cancelada.'), false);
  assert.equal(requests, 0);
});


test('resource suppresses duplicate mutations and refreshes only after server confirmation', async () => {
  let reads = 0, writes = 0;
  const pending = deferred();
  const vm = new SessionResource(async () => ({ cantidad: reads++ }), true);
  await vm.cargar();
  const write = vm.ejecutar(async () => { writes++; await pending.promise; }, 'Confirmado');
  assert.equal(await vm.ejecutar(async () => { writes++; }, 'Duplicado'), false);
  pending.resolve(); assert.equal(await write, true);
  assert.equal(writes, 1); assert.equal(reads, 2); assert.equal(vm.getSnapshot().mensaje, 'Confirmado');
});


test('an old 401 must not invalidate a newly established account', async () => {
  let key = 'A', clears = 0, expired = 0;
  const response = deferred();
  setAuthRequestHooks({ sessionKey: () => key, cookieHeader: async () => 'authjs.session-token=test-only', clear: async () => { clears++; }, onExpired: () => { expired++; } });
  try {
    const client = new FetchHttpClient(() => 'https://example.invalid', async () => response.promise);
    const request = client.get('/api/mis-cursos');
    await Promise.resolve(); await Promise.resolve(); key = 'B';
    response.resolve(new Response('{"error":"Expired A"}', { status: 401 }));
    await assert.rejects(request, HttpError);
    assert.equal(clears, 0); assert.equal(expired, 0);
  } finally { setAuthRequestHooks(null); }
});


test('signout completes before the next login changes cookies, even after a rejected transition', async () => {
  const queue = new SessionTransitions(); const gate = deferred(); const order = [];
  const signout = queue.run(async () => { order.push('logout-start'); await gate.promise; order.push('logout-end'); throw new Error('Fixture outage'); });
  const rejection = assert.rejects(signout);
  const login = queue.run(async () => { order.push('login'); });
  await Promise.resolve(); assert.deepEqual(order, ['logout-start']);
  gate.resolve(); await rejection; await login;
  assert.deepEqual(order, ['logout-start', 'logout-end', 'login']);
});
