const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { test } = require('node:test');
const { FetchHttpClient, HttpError, setAuthRequestHooks } = require('@/services/api');
const { AdapterError } = require('@/shared/adapters/adapter-error');
const { InputError } = require('@/shared/adapters/input-error');
const { SessionResource } = require('@/shared/viewmodels/session-resource');
const { pedidoCreadoResponse } = require('@/modules/ventas/adapters/ventas-adapter');
const { HttpVentasService } = require('@/modules/ventas/services/ventas-service');

const perfil = Object.freeze({ nombre: 'Persona Real', correo: 'persona@example.test', telefono: null, fechaRegistro: null });
const respuesta = Object.freeze({ ok: true, pedido_id: 123, total: 840.5, metodo_pago: 'transferencia' });

test('ventas envía solo el perfil autenticado y transferencia mediante POST con cookie de sesión', async () => {
  let request;
  setAuthRequestHooks({ cookieHeader: async () => 'authjs.session-token=opaque', clear: async () => {}, onExpired: () => {} });
  try {
    const http = new FetchHttpClient(() => 'https://example.invalid', async (url, options) => {
      request = { url, options };
      return new Response(JSON.stringify(respuesta));
    });
    const pedido = await new HttpVentasService(http).crear('transferencia', perfil);
    assert.deepEqual(pedido, { id: '123', total: '840.50' });
    assert.equal(request.url, 'https://example.invalid/api/pedidos');
    assert.equal(request.options.method, 'POST');
    assert.equal(request.options.headers.Cookie, 'authjs.session-token=opaque');
    assert.equal(request.options.headers['Content-Type'], 'application/json');
    assert.equal(request.options.credentials, 'include');
    assert.deepEqual(JSON.parse(request.options.body), {
      metodo_pago: 'transferencia', nombre_cliente: perfil.nombre,
      correo_cliente: perfil.correo, telefono_cliente: null,
    });
  } finally {
    setAuthRequestHooks(null);
  }
});

test('adapter valida contrato completo y acepta solo ruido binario menor que un centavo real', () => {
  assert.deepEqual(pedidoCreadoResponse({ ...respuesta, total: 0.1 + 0.2 }, 'transferencia'), { id: '123', total: '0.30' });
  assert.deepEqual(pedidoCreadoResponse({ ...respuesta, total: 0 }, 'transferencia'), { id: '123', total: '0.00' });
  for (const value of [null, {}, { ...respuesta, ok: false }, { ...respuesta, pedido_id: 0 },
    { ...respuesta, total: -1 }, { ...respuesta, total: NaN }, { ...respuesta, total: Infinity },
    { ...respuesta, total: '840.50' }, { ...respuesta, total: 840.501 },
    { ...respuesta, metodo_pago: 'tarjeta' }, { ...respuesta, metodo_pago: undefined }]) {
    assert.throws(() => pedidoCreadoResponse(value, 'transferencia'), AdapterError);
  }
});

test('ventas conserva errores HTTP 400, 401, 409 y 500 sin crear comprobantes locales', async () => {
  for (const status of [400, 401, 409, 500]) {
    const http = new FetchHttpClient(() => 'https://example.invalid', async () =>
      new Response(JSON.stringify({ error: 'Error del servidor' }), { status }));
    await assert.rejects(new HttpVentasService(http).crear('transferencia', perfil),
      error => error instanceof HttpError && error.status === status && error.body.error === 'Error del servidor');
  }
});

test('servicio y estado de sesión impiden dos confirmaciones simultáneas', async () => {
  let resolve;
  let requests = 0;
  const pending = new Promise(done => { resolve = done; });
  const http = new FetchHttpClient(() => 'https://example.invalid', async () => {
    requests++;
    return pending;
  });
  const service = new HttpVentasService(http);
  const resource = new SessionResource(async () => [], true);
  const first = resource.ejecutar(() => service.crear('transferencia', perfil), 'Pedido pendiente');
  assert.equal(await resource.ejecutar(() => service.crear('transferencia', perfil), 'Duplicado'), false);
  await assert.rejects(service.crear('transferencia', perfil), InputError);
  resolve(new Response(JSON.stringify(respuesta)));
  assert.equal(await first, true);
  assert.equal(requests, 1);
});

test('solo transferencia está disponible en la interfaz y el servicio rechaza otros métodos', async () => {
  const view = fs.readFileSync(path.join(__dirname, '..', 'src/modules/carrito/views/carrito-view.tsx'), 'utf8');
  assert.match(view, /Método de pago.*Transferencia bancaria/);
  assert.doesNotMatch(view, /ChoiceChips|['"]tarjeta['"]|['"]efectivo['"]/);
  let requests = 0;
  const http = new FetchHttpClient(() => 'https://example.invalid', async () => { requests++; return new Response(JSON.stringify(respuesta)); });
  const service = new HttpVentasService(http);
  for (const method of ['tarjeta', 'efectivo']) await assert.rejects(service.crear(method, perfil), InputError);
  assert.equal(requests, 0);
});
