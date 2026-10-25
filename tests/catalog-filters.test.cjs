const assert = require('node:assert/strict');
const { test } = require('node:test');
const { filterProductos, opcionesFiltroProductos, sortProductos } = require('@/modules/productos/viewmodels/product-filters');

const products = [
  { id: '1', nombre: 'Sérum rosa', descripcion: 'Hidratación', marca: 'Brenn', categoria: 'Rostro', precio: '200.00', enStock: true, variantes: [{ tono: 'Cálido', presentacion: '30 ml' }] },
  { id: '2', nombre: 'Crema', descripcion: null, marca: 'Brenn', categoria: 'Cuerpo', precio: '90.00', enStock: false, variantes: [] },
  { id: '3', nombre: 'Aceite', descripcion: null, marca: null, categoria: 'Rostro', precio: null, enStock: true, variantes: [] },
];

test('product search matches accents and variants, and combines text with selected facet', () => {
  assert.deepEqual(filterProductos(products, 'serum', 'Todos').map((item) => item.id), ['1']);
  assert.deepEqual(filterProductos(products, 'calido', 'Con existencias').map((item) => item.id), ['1']);
  assert.deepEqual(filterProductos(products, 'crema', 'Con existencias'), []);
  assert.deepEqual(filterProductos(products, '', 'Categoría: Rostro').map((item) => item.id), ['1', '3']);
  assert.deepEqual(filterProductos(products, '', 'Todos'), products);
});

test('product filter options and orders preserve publication order and put missing prices last', () => {
  assert.deepEqual(opcionesFiltroProductos(products), ['Todos', 'Categoría: Rostro', 'Categoría: Cuerpo', 'Con existencias']);
  assert.equal(sortProductos(products, 'Publicación'), products);
  assert.deepEqual(sortProductos(products, 'Precio menor').map((item) => item.id), ['2', '1', '3']);
  assert.deepEqual(sortProductos(products, 'Precio mayor').map((item) => item.id), ['1', '2', '3']);
  assert.deepEqual(sortProductos(products, 'Nombre A–Z').map((item) => item.id), ['3', '2', '1']);
  assert.deepEqual(products.map((item) => item.id), ['1', '2', '3']);
});
