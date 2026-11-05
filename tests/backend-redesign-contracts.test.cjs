const assert = require('node:assert/strict');
const { test } = require('node:test');
const Module = require('node:module');

const { HttpAuthService } = require('@/modules/auth/services/auth-service');
const { pedidosResponse } = require('@/modules/ventas/adapters/pedidos-adapter');
const originalLoad = Module._load;
Module._load = function(request, ...args) {
  if (request === 'expo-crypto') return { randomUUID: require('node:crypto').randomUUID };
  if (request === 'expo-file-system') return { File: class {}, Directory: class {}, Paths: {} };
  if (request === 'expo/fetch') return { fetch: global.fetch };
  return originalLoad.call(this, request, ...args);
};
let HttpComprobanteService, comprobanteType;
try {
  ({ HttpComprobanteService, comprobanteType } = require('@/shared/services/comprobante-service'));
} finally {
  Module._load = originalLoad;
}

test('password recovery and reset use the verified email-link endpoints', async () => {
  const calls = [];
  const http = { request: async (path, options) => { calls.push({ path, options }); return { status: 200, body: { ok: true } }; } };
  const service = new HttpAuthService(http);
  await service.recuperarContrasena('  cliente@example.com ');
  await service.restablecerContrasena(' token ', 'nueva-clave-123');
  assert.deepEqual(calls.map(call => call.path), ['/api/auth/recuperar-contrasena', '/api/auth/reset-contrasena']);
  assert.deepEqual(JSON.parse(calls[0].options.body), { correo: 'cliente@example.com' });
  assert.deepEqual(JSON.parse(calls[1].options.body), { token: 'token', password: 'nueva-clave-123' });
  assert.equal(calls[0].options.authenticated, false);
});

test('order history preserves server status, total, proof and line items', () => {
  const orders = pedidosResponse([{ id: 7, estado: 'PENDIENTE', total: 750, fecha_pedido: '2026-10-20T12:00:00.000Z', comprobante_url: null,
    detalles: [{ id: 9, nombre_producto: 'Sérum', descripcion_variante: null, cantidad: 2, subtotal: 640, imagen: ['bad', 'https://example.invalid/serum.jpg'] }] }]);
  assert.equal(orders[0].id, '7');
  assert.equal(orders[0].estado, 'PENDIENTE');
  assert.equal(orders[0].total, '750.00');
  assert.equal(orders[0].comprobanteRecibido, false);
  assert.deepEqual(orders[0].detalles.map(item => [item.nombre, item.cantidad, item.subtotal]), [['Sérum', 2, '640.00']]);
  assert.equal(orders[0].detalles[0].imagen, 'https://example.invalid/serum.jpg');
});

test('proof upload validates format and size and sends multipart file to the owned order route', async () => {
  const calls = [];
  const http = { request: async (path, options) => { calls.push({ path, options }); return { status: 200, body: { ok: true, url: 'https://example.invalid/proof.pdf' } }; } };
  const service = new HttpComprobanteService(http);
  const asset = { name: 'comprobante.pdf', mimeType: 'application/pdf', size: 123, uri: 'file:///proof.pdf', file: new Blob(['proof'], { type: 'application/pdf' }) };
  await service.subir('pedidos', '7', asset);
  assert.equal(calls[0].path, '/api/pedidos/7/comprobante');
  assert.equal(calls[0].options.method, 'POST');
  assert.ok(calls[0].options.body instanceof FormData);
  assert.equal(calls[0].options.body.has('file'), true);
  assert.throws(() => comprobanteType({ ...asset, name: 'bad.txt', mimeType: 'text/plain' }), /JPG/);
  assert.throws(() => comprobanteType({ ...asset, name: 'bad.txt', mimeType: 'application/pdf' }), /JPG/);
  assert.throws(() => comprobanteType({ ...asset, name: 'constructor', mimeType: null }), /JPG/);
  assert.throws(() => comprobanteType({ ...asset, name: 'photo.jpg', mimeType: 'application/pdf' }), /JPG/);
  assert.equal(comprobanteType({ ...asset, name: 'photo.JPG', mimeType: null }), 'image/jpeg');
  assert.throws(() => comprobanteType({ ...asset, size: 11 * 1024 * 1024 }), /10 MB/);
});
