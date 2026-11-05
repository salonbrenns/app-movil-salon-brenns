import type { DocumentPickerAsset } from 'expo-document-picker';
import { File } from 'expo-file-system';
import { HttpAgendaService } from '@/modules/agenda/services/agenda-service';
import { horariosResponse, diasBloqueadosResponse } from '@/modules/agenda/adapters/agenda-adapter';
import { HttpInscripcionesService } from '@/modules/cursos/services/inscripciones-service';
import { misCursosResponse } from '@/modules/cursos/adapters/inscripciones-adapter';
import { cursoFinalizado } from '@/modules/cursos/models/curso';
import { HttpVentasService } from '@/modules/ventas/services/ventas-service';
import { PaymentOperationService } from '@/modules/pagos/services/payment-operation-service';
import { transferenciaResponse } from '@/shared/adapters/transferencia-adapter';
import { HttpComprobanteService, comprobanteType, prepararComprobante } from '@/shared/services/comprobante-service';
import { FetchHttpClient, HttpError, setAuthRequestHooks, type HttpMutationClient, type HttpRequestOptions } from '@/services/api';
import { operationError } from '@/shared/viewmodels/session-resource';
import { AdapterError } from '@/shared/adapters/adapter-error';
import { bancoAprobado } from '@/config/transferencia-aprobada';

jest.mock('expo-file-system', () => {
  class MockDirectory {
    uri: string;
    constructor(_cache: string, name: string) { this.uri = `file:///cache/${name}`; }
    create() {}
    delete() {}
  }
  class MockFile extends Blob {
    uri: string;
    name: string;
    exists: boolean;
    constructor(location: string | MockDirectory, name?: string) {
      super([new Uint8Array([1, 2, 3])], { type: (name ?? String(location)).endsWith('.pdf') ? 'application/pdf' : 'image/jpeg' });
      this.uri = name ? `${location instanceof MockDirectory ? location.uri : location}/${name}` : String(location);
      this.name = name ?? this.uri.split('/').pop() ?? '';
      this.exists = false;
    }
    async copy(target: MockFile) { await Promise.resolve(); target.exists = true; }
    async bytes() { return new Uint8Array([1, 2, 3]); }
  }
  return { File: MockFile, Directory: MockDirectory, Paths: { cache: 'file:///cache' } };
});

const proof: DocumentPickerAsset = { name: 'pago.pdf', mimeType: 'application/pdf', size: 120, uri: 'file:///pago.pdf', lastModified: 0 };
const course = {
  cursos: [{ inscripcionId: 21, estado: 'ACTIVO', fecha_inscripcion: '2026-10-25T10:00:00.000Z', totalPagado: 0, diasAsistidos: 0,
    curso: { id: 7, titulo: 'Colorimetría', precio_total: 1200 }, pagos: [{ id: 31, monto: 1200, estado: 'PENDIENTE', comprobante_url: null }] }],
};
const appointment = [{ id: 41, servicio_id: 3, servicio: { nombre: 'Corte', duracion: '1h' }, total: '150.00', fecha: '2026-11-10T10:00:00.000Z', hora: '10:00', estado: 'PENDIENTE', comprobante: null }];
const orders = [{ id: 51, estado: 'PENDIENTE', total: 360, fecha_pedido: '2026-10-25T10:00:00.000Z', comprobante_url: null, detalles: [] }];

function client(get: HttpMutationClient['get'], request: HttpMutationClient['request']): HttpMutationClient {
  return { get, request };
}

test('usa datos bancarios previamente aprobados sólo si la API omite todas las claves', () => {
  expect(transferenciaResponse({})).toMatchObject({ banco: bancoAprobado, fuente: 'aprobada' });
  expect(() => transferenciaResponse({ banco_banco: 'Banco', banco_titular: 'Titular', banco_cuenta: '1234567890', banco_clabe: '123' })).toThrow(new AdapterError('config-sitio.banco_clabe', 'CLABE de 18 dígitos'));
  expect(() => transferenciaResponse({ banco_banco: 'Banco' })).toThrow(new AdapterError('config-sitio.banco_titular', 'titular no vacío'));
  expect(transferenciaResponse({ banco_banco: 'Banco', banco_titular: 'Titular', banco_cuenta: '1234567890', banco_clabe: '123456789012345678' })).toMatchObject({ fuente: 'api', banco: { banco: 'Banco', titular: 'Titular' } });
  expect(operationError(new AdapterError('config-sitio.banco_banco', 'banco no vacío')).message).toContain('datos bancarios');
});

test('adapta los contratos de horarios, días bloqueados y mis cursos sin relajar sus campos', () => {
  expect(horariosResponse({ sinAtencion: false, horarios: [{ id: 3, hora: '16:00', disponible: true }] })).toEqual({ sinAtencion: false, horarios: [{ id: '3', hora: '16:00', disponible: true }] });
  expect(diasBloqueadosResponse([{ id: 1, fecha: '2026-10-30T00:00:00.000Z', motivo: 'Cierre' }])).toEqual(['2026-10-30']);
  expect(misCursosResponse(course)[0]).toMatchObject({ id: '21', cursoId: '7', pagos: [{ id: '31', estado: 'PENDIENTE' }] });
  expect(() => horariosResponse({ sinAtencion: false, horarios: [{ id: 3, hora: '16:00' }] })).toThrow(AdapterError);
});

test('impide nuevas inscripciones a un curso terminado y permite las de fecha vigente', () => {
  const curso = { id: '11', nombre: 'Curso', precio: '2500.00', fechaFin: '2026-08-02' };
  expect(cursoFinalizado(curso, '2026-10-27')).toBe(true);
  expect(cursoFinalizado(curso, '2026-08-02')).toBe(false);
});

test('recupera el pago pendiente de un curso sin registrar otra inscripción', async () => {
  const get = jest.fn(async (path: string) => path.endsWith('/estado') ? { inscrito: true, inscripcionId: 21 } : course);
  const request = jest.fn();
  const service = new HttpInscripcionesService(client(get, request));
  await expect(service.inscribir('7')).resolves.toEqual({ inscripcionId: '21', pagoId: '31', monto: '1200' });
  expect(request).not.toHaveBeenCalled();
});

test('crea la inscripción real y recupera un conflicto con pago ya existente', async () => {
  const get = jest.fn().mockResolvedValueOnce({ inscrito: false }).mockResolvedValueOnce({ cursos: [] }).mockResolvedValueOnce(course);
  const request = jest.fn().mockRejectedValue(new HttpError(409, { error: 'Ya estás inscrito' }, '/api/cursos/7/inscribir'));
  const service = new HttpInscripcionesService(client(get, request));
  await expect(service.inscribir('7')).resolves.toEqual({ inscripcionId: '21', pagoId: '31', monto: '1200' });
  expect(request).toHaveBeenCalledTimes(1);
  expect(request.mock.calls[0][0]).toBe('/api/cursos/7/inscribir');
});

test('el estado de curso inscrito bloquea una segunda inscripción si no queda pago pendiente', async () => {
  const get = jest.fn(async (path: string) => path.endsWith('/estado') ? { inscrito: true, inscripcionId: 21 } : { cursos: [] });
  const request = jest.fn();
  const service = new HttpInscripcionesService(client(get, request));
  await expect(service.inscribir('7')).rejects.toThrow('Ya estás inscrito');
  expect(request).not.toHaveBeenCalled();
});

test('recupera una cita creada si la respuesta de creación se pierde', async () => {
  const get = jest.fn(async () => appointment);
  const request = jest.fn().mockRejectedValue(new TypeError('fetch failed'));
  const service = new HttpAgendaService(client(get, request));
  await expect(service.reservar('3', '2026-11-10', '10:00', '150.00')).resolves.toEqual({ id: '41', estado: 'PENDIENTE' });
  expect(request).toHaveBeenCalledTimes(1);
  expect(get).toHaveBeenCalledWith('/api/citas', undefined);
});

test('recupera el pedido nuevo tras perder la respuesta sin crear otro', async () => {
  const recentOrder = { ...orders[0], fecha_pedido: new Date().toISOString() };
  const get = jest.fn(async () => [recentOrder]);
  const request = jest.fn().mockRejectedValue(new TypeError('fetch failed'));
  const service = new HttpVentasService(client(get, request));
  await expect(service.crear('transferencia', { nombre: 'Ana', correo: 'ana@example.com', telefono: null, fechaRegistro: null })).resolves.toEqual({ id: '51', total: '360.00' });
  expect(request).toHaveBeenCalledTimes(1);
  expect(get).toHaveBeenCalledWith('/api/pedidos', undefined);
});

test('consulta los registros reales para recuperar pagos de cita, curso y pedido', async () => {
  const get = jest.fn(async (path: string) => path === '/api/citas' ? appointment : path === '/api/mis-cursos' ? course : orders);
  const request = jest.fn();
  const http = client(get, request);
  const service = new PaymentOperationService(new HttpAgendaService(http), new HttpInscripcionesService(http), new HttpVentasService(http));
  await expect(service.obtener('cita', '41')).resolves.toMatchObject({ title: 'Corte', amount: '150.00', canUpload: true });
  await expect(service.obtener('curso', '31')).resolves.toMatchObject({ title: 'Colorimetría', amount: '1200', canUpload: true });
  await expect(service.obtener('pedido', '51')).resolves.toMatchObject({ title: 'Pedido #51', amount: '360.00', canUpload: true });
  expect(request).not.toHaveBeenCalled();
});

test('el comprobante del curso bloquea otro envío aunque el pago siga pendiente', async () => {
  const withProof = { cursos: [{ ...course.cursos[0], pagos: [{ ...course.cursos[0].pagos[0], comprobante_url: 'https://example.test/proof.pdf' }] }] };
  const get = jest.fn(async () => withProof);
  const http = client(get, jest.fn());
  const service = new PaymentOperationService(new HttpAgendaService(http), new HttpInscripcionesService(http), new HttpVentasService(http));
  await expect(service.obtener('curso', '31')).resolves.toMatchObject({ status: 'PENDIENTE', proofReceived: true, canUpload: false });
});

test('sube FormData autenticado por el endpoint del pago y bloquea envíos duplicados', async () => {
  let complete: ((value: { status: number; body: { ok: boolean; url: string }; headers: Headers }) => void) | undefined;
  const request = jest.fn((_path: string, _options?: HttpRequestOptions) => new Promise<{ status: number; body: { ok: boolean; url: string }; headers: Headers }>((resolve) => { complete = resolve; }));
  const service = new HttpComprobanteService(client(jest.fn(), request));
  const pending = service.subir('pagos-curso', '31', proof);
  await expect(service.subir('pagos-curso', '31', proof)).rejects.toThrow('ya se está enviando');
  await new Promise((resolve) => setTimeout(resolve, 0));
  expect(request).toHaveBeenCalledTimes(1);
  expect(request.mock.calls[0][0]).toBe('/api/pagos-curso/31/comprobante');
  expect(request.mock.calls[0][1]?.body).toBeInstanceOf(FormData);
  expect((request.mock.calls[0][1]?.body as FormData).get('file')).toMatchObject({ name: 'pago.pdf', type: 'application/pdf', size: 3 });
  expect(request.mock.calls[0][1]?.headers).toBeUndefined();
  complete?.({ status: 200, body: { ok: true, url: 'https://example.invalid/proof.pdf' }, headers: new Headers() });
  await pending;
});

test('prepara el archivo al seleccionarlo y espera la copia antes del transporte', async () => {
  const prepared = await prepararComprobante(proof);
  expect(prepared.asset.uri).toContain('/comprobante-');
  expect(prepared.asset.uri).toContain('/pago.pdf');
  const request = jest.fn().mockResolvedValue({ status: 200, body: { ok: true, url: 'https://example.invalid/recibo.pdf' }, headers: new Headers() });
  const service = new HttpComprobanteService(client(jest.fn(), request));
  await service.subir('pedidos', '51', prepared.asset);
  expect(request).toHaveBeenCalledTimes(1);
  prepared.cleanup();

  let releaseCopy: (() => void) | undefined;
  const copyGate = new Promise<void>((resolve) => { releaseCopy = resolve; });
  const copy = File.prototype.copy;
  const spy = jest.spyOn(File.prototype, 'copy').mockImplementation(async function (this: File, destination, options) {
    await copyGate;
    await copy.call(this, destination, options);
  });
  try {
    const pending = service.subir('citas', '41', proof);
    await Promise.resolve();
    expect(request).toHaveBeenCalledTimes(1);
    releaseCopy?.();
    await pending;
    expect(request).toHaveBeenCalledTimes(2);
  } finally {
    releaseCopy?.();
    spy.mockRestore();
  }
});

test('rechaza HEIC, archivos mayores de 10 MB y conserva errores HTTP del servidor', async () => {
  const path = '/api/pedidos/51/comprobante';
  const request = jest.fn()
    .mockRejectedValueOnce(new HttpError(401, { error: 'Sesión vencida' }, path))
    .mockRejectedValueOnce(new HttpError(403, { error: 'No autorizado' }, path))
    .mockRejectedValueOnce(new HttpError(409, { error: 'Ya subiste un comprobante' }, path))
    .mockRejectedValueOnce(new TypeError('fetch failed'));
  const service = new HttpComprobanteService(client(jest.fn(), request));
  await expect(service.subir('pedidos', '51', { ...proof, name: 'imagen.heic', mimeType: 'image/heic' })).rejects.toThrow(/JPG/);
  await expect(service.subir('pedidos', '51', { ...proof, size: 10 * 1024 * 1024 + 1 })).rejects.toThrow(/10 MB/);
  expect(request).not.toHaveBeenCalled();
  for (const status of [401, 403, 409]) {
    try { await service.subir('pedidos', '51', proof); throw new Error('Se esperaba un error HTTP.'); }
    catch (error) { expect(error).toMatchObject({ status }); expect(operationError(error).message).toBeTruthy(); }
  }
  await expect(service.subir('pedidos', '51', proof)).rejects.toThrow('fetch failed');
  expect(operationError(new TypeError('fetch failed')).kind).toBe('conexion');
  expect(request).toHaveBeenCalledTimes(4);
});

test('acepta JPG y PDF y envía el archivo con la cookie autenticada', async () => {
  expect(comprobanteType({ ...proof, name: 'foto.jpg', mimeType: 'image/jpeg' })).toBe('image/jpeg');
  expect(comprobanteType(proof)).toBe('application/pdf');
  const fetcher = jest.fn(async (_url: string | URL | Request, _options?: RequestInit) => new Response(JSON.stringify({ ok: true, url: 'https://example.invalid/recibo.jpg' }), { status: 200 }));
  setAuthRequestHooks({ sessionKey: () => 'sesion-1', cookieHeader: async () => 'authjs.session-token=test', clear: async () => {}, onExpired: () => {} });
  try {
    const service = new HttpComprobanteService(new FetchHttpClient(() => 'https://example.invalid', fetcher));
    await service.subir('citas', '41', { ...proof, name: 'foto.jpg', mimeType: 'image/jpeg' });
    expect(fetcher).toHaveBeenCalledTimes(1);
    expect(fetcher.mock.calls[0][0]).toBe('https://example.invalid/api/citas/41/comprobante');
    expect(fetcher.mock.calls[0][1]).toMatchObject({ method: 'POST', credentials: 'include', headers: { Cookie: 'authjs.session-token=test', Accept: 'application/json' } });
    expect(fetcher.mock.calls[0][1]?.headers).not.toHaveProperty('Content-Type');
    expect(fetcher.mock.calls[0][1]?.body).toBeInstanceOf(FormData);
  } finally {
    setAuthRequestHooks(null);
  }
});

test('una respuesta sin URL no confirma el comprobante y permite reintentar', async () => {
  const request = jest.fn().mockResolvedValueOnce({ status: 200, body: { ok: true }, headers: new Headers() })
    .mockResolvedValueOnce({ status: 200, body: { ok: true, url: 'https://example.invalid/recibo.pdf' }, headers: new Headers() });
  const service = new HttpComprobanteService(client(jest.fn(), request));
  await expect(service.subir('pedidos', '51', proof)).rejects.toThrow();
  await expect(service.subir('pedidos', '51', proof)).resolves.toBeUndefined();
  expect(request).toHaveBeenCalledTimes(2);
});
