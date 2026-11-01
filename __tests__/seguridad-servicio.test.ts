import { HttpPerfilService } from '@/modules/perfil/services/perfil-service';
import { FetchHttpClient, HttpError, setAuthRequestHooks } from '@/services/api';

afterEach(() => setAuthRequestHooks(null));

test('PUT envía las dos claves exactas con sesión y confirma ok: true', async () => {
  const actual = ` ${Math.random().toString(36).slice(2).padEnd(8, 'x')} `;
  const nueva = Math.random().toString(36).slice(2).padEnd(8, 'y');
  const requests: { path: string; options: RequestInit }[] = [];
  setAuthRequestHooks({ cookieHeader: async () => 'authjs.session-token=fixture', clear: async () => {}, onExpired: () => {} });
  const client = new FetchHttpClient(() => 'https://example.invalid', async (url, options) => {
    requests.push({ path: new URL(String(url)).pathname, options: options ?? {} });
    return new Response('{"ok":true}', { status: 200, headers: { 'Content-Type': 'application/json' } });
  });
  await new HttpPerfilService(client).cambiarPassword(actual, nueva);
  expect(requests).toHaveLength(1);
  expect(requests[0].path).toBe('/api/usuario/password');
  expect(requests[0].options.method).toBe('PUT');
  expect(requests[0].options.headers).toMatchObject({ 'Content-Type': 'application/json', Cookie: 'authjs.session-token=fixture' });
  expect(JSON.parse(String(requests[0].options.body))).toEqual({ passwordActual: actual, passwordNueva: nueva });
});

test('una respuesta sin ok: true o con 400 nunca se interpreta como éxito', async () => {
  const actual = Math.random().toString(36).slice(2).padEnd(8, 'x');
  const nueva = Math.random().toString(36).slice(2).padEnd(8, 'y');
  const invalid = new HttpPerfilService(new FetchHttpClient(() => 'https://example.invalid', async () => new Response('{"ok":false}')));
  await expect(invalid.cambiarPassword(actual, nueva)).rejects.toThrow();
  const rejected = new HttpPerfilService(new FetchHttpClient(() => 'https://example.invalid', async () => new Response('{"error":"La contraseña actual es incorrecta"}', { status: 400 })));
  await expect(rejected.cambiarPassword(actual, nueva)).rejects.toBeInstanceOf(HttpError);
});
