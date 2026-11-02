const assert = require('node:assert/strict');
const { test } = require('node:test');
const { pedidosResponse } = require('@/modules/ventas/adapters/pedidos-adapter');
const { carritoResponse } = require('@/modules/carrito/adapters/carrito-adapter');

const detail = (id, precio, cantidad) => ({ id, nombre_producto: `Producto ${id}`, descripcion_variante: null, precio_unitario: precio, cantidad, subtotal: precio * cantidad, imagen: null });
const order = (id, estado, detalles, total, costo_envio = 0) => ({ id, estado, subtotal: detalles.reduce((sum, item) => sum + item.subtotal, 0), costo_envio, total, fecha_pedido: '2026-10-30T12:00:00.000Z', comprobante_url: null, detalles });

test('carrito, pedidos actuales e historial mantienen precio unitario, cantidades y total sin cargo extra', () => {
  const cart = carritoResponse([
    { id: 1, variante_id: 1, tono: null, presentacion: null, precio_venta: 249.5, cantidad: 2, stock: 5, producto: { nombre: 'Uno', imagen: null } },
    { id: 2, variante_id: 2, tono: null, presentacion: null, precio_venta: 80, cantidad: 3, stock: 5, producto: { nombre: 'Dos', imagen: null } },
  ]);
  assert.equal(cart.resumen.subtotal, '739.00');
  const [actual, historial] = pedidosResponse([
    order(1, 'PENDIENTE', [detail(1, 249.5, 2), detail(2, 80, 3)], 739),
    order(2, 'ENTREGADO', [detail(3, 35, 2)], 70),
  ]);
  assert.equal(actual.total, cart.resumen.subtotal);
  assert.equal(actual.importeProductos, '739.00');
  assert.equal(actual.detalles[0].precioUnitario, '249.50');
  assert.equal(actual.requiereRevision, false);
  assert.equal(historial.total, '70.00');
  assert.equal(historial.requiereRevision, false);
});

test('identifica pedidos históricos con los $100 de envío guardados sin alterar el total del servidor', () => {
  const [orderWithFee] = pedidosResponse([order(9, 'ENTREGADO', [detail(10, 200, 2)], 500, 100)]);
  assert.equal(orderWithFee.total, '500.00');
  assert.equal(orderWithFee.importeProductos, '400.00');
  assert.equal(orderWithFee.costoEnvio, '100.00');
  assert.equal(orderWithFee.requiereRevision, true);
});
