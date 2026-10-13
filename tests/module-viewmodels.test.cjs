const assert = require('node:assert/strict');
const { test } = require('node:test');
const { FetchHttpClient, HttpError } = require('@/services/api');
const { AdapterError, ModelNotFoundError } = require('@/shared/adapters/adapter-error');
const { HttpCursosService } = require('@/modules/cursos/services/cursos-service');
const { ComposedCatalogoService } = require('@/modules/catalogo/services/catalogo-service');
const { CatalogoViewModel } = require('@/modules/catalogo/viewmodels/catalogo-view-model');
const { CursosViewModel } = require('@/modules/cursos/viewmodels/cursos-view-model');
const { filtrarCursos } = require('@/modules/catalogo/viewmodels/use-catalogo-view-model');
const { loginDestination, isProtectedPath } = require('@/modules/auth/models/auth-navigation');
// Local fixtures using the already implemented contracts; no backend requests.
const dto = { id: 7, titulo: 'Curso de especialización', descripcion: null, precio_total: '1200.00', duracion_horas: 20, nivel: 'Avanzado', fecha_inicio: '2026-09-30T00:00:00.000Z', fecha_fin: null };
function fixture(body, status = 200) {
 const requests = [];
 const http = new FetchHttpClient(() => 'https://example.invalid', async (url, options) => {
  requests.push({ path: new URL(url).pathname, options });
  return new Response(status === 204 ? null : JSON.stringify(body), { status });
 });
 return { http, requests };
}
test('course-only catalog and detail consume the real HTTP service and Adapter', async () => {
 const f = fixture({ cursos: [dto] });
 const service = new HttpCursosService(f.http);
 const catalog = new CatalogoViewModel(new ComposedCatalogoService(service));
 await catalog.cargar();
 assert.deepEqual(Object.keys(catalog.getSnapshot().datos), ['Cursos']);
 assert.equal(catalog.getSnapshot().datos.Cursos[0].precio, '1200.00');
 const detail = new CursosViewModel(service, '7'); await detail.cargar();
 assert.equal(detail.getSnapshot().datos.nombre, dto.titulo);
 assert.deepEqual(f.requests.map(r => r.path), ['/api/cursos', '/api/cursos']);
 assert.equal(f.requests[0].options.credentials, 'include');
});
test('course list failures do not become successful empty catalogs', async () => {
 for (const [body, status, kind] of [[{ error: 'Fixture outage' }, 500, 'http'], [{ cursos: [ { ...dto, precio_total: null } ] }, 200, 'adaptacion']]) {
  const vm = new CatalogoViewModel(new ComposedCatalogoService(new HttpCursosService(fixture(body,status).http)));
  await vm.cargar(); assert.equal(vm.getSnapshot().estadoCarga, 'error'); assert.equal(vm.getErrorType(), kind);
 }
});
test('course detail validates IDs, missing courses and absence of an ID without invented records', async () => {
 const f = fixture({ cursos: [dto] }); const service = new HttpCursosService(f.http);
 await assert.rejects(service.obtener('fake'), AdapterError); assert.equal(f.requests.length, 0);
 await assert.rejects(service.obtener('8'), ModelNotFoundError);
 const vm = new CursosViewModel(service); await vm.cargar(); assert.equal(vm.getSnapshot().datos, null); assert.equal(f.requests.length, 1);
 const denied = new HttpCursosService(fixture({error:'Rejected'},403).http); await assert.rejects(denied.listar(), HttpError);
});
test('existing course search is accent-insensitive and combines name/description/level with the level filter', () => {
 const courses = [{ id: '7', nombre: dto.titulo, descripcion: 'Coloración', nivel: 'Avanzado', precio: '1200' }, { id: '8', nombre: 'Introducción', descripcion: null, nivel: 'Inicial', precio: '500' }];
 assert.deepEqual(filtrarCursos(courses,'especializacion','Todos').map(c => c.id), ['7']);
 assert.deepEqual(filtrarCursos(courses,'coloracion','Avanzado').map(c => c.id), ['7']);
 assert.deepEqual(filtrarCursos(courses,'avanzado','Inicial'), []);
 assert.deepEqual(filtrarCursos(courses,'','Todos'), courses);
});
test('included login destinations retain the common routes and reject unimplemented/external ones', () => {
 for (const p of ['/', '/catalogo?categoria=Cursos&q=color', '/cursos?id=7', '/agenda', '/servicios', '/perfil', '/cuenta/cerrar-sesion']) assert.equal(loginDestination(p),p);
 for (const p of ['/carrito', '/productos/1', '/cuenta/compras', '/autenticacion', '//evil.invalid', 'https://evil.invalid', '/cursos#fragment', '/cuenta/cursos/extra']) assert.equal(loginDestination(p), '/');
 assert.equal(isProtectedPath('/cuenta/cerrar-sesion'),true); assert.equal(isProtectedPath('/cursos'),false); assert.equal(isProtectedPath('/cuenta/crear-cuenta'),false);
});
