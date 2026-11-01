import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { SeguridadView } from '@/modules/perfil/views/seguridad-view';
import { HttpError } from '@/services/api';

const mockCambiarPassword = jest.fn<Promise<void>, [string, string]>();
jest.mock('expo-router', () => ({ Link: ({ children }: { children: import('react').ReactNode }) => children }));
jest.mock('@/components/ui/style-guide', () => ({ MenuRow: () => null }));
jest.mock('@/modules/perfil/services/perfil-service', () => ({
  HttpPerfilService: class {
    cambiarPassword(actual: string, nueva: string) { return mockCambiarPassword(actual, nueva); }
  },
}));

const current = `actual-${Math.random().toString(36).slice(2).padEnd(8, 'x')}`;
const next = `nueva-${Math.random().toString(36).slice(2).padEnd(8, 'y')}`;
async function fill(actual = current, nueva = next, confirmacion = nueva) {
  await fireEvent.changeText(screen.getByLabelText('Contraseña actual'), actual);
  await fireEvent.changeText(screen.getByLabelText('Nueva contraseña'), nueva);
  await fireEvent.changeText(screen.getByLabelText('Confirmar nueva contraseña'), confirmacion);
}
async function save() { await fireEvent.press(screen.getByRole('button', { name: 'Guardar contraseña' })); }
beforeEach(() => mockCambiarPassword.mockReset());

test.each([
  { values: ['', next, next], message: 'Ingresa tu contraseña actual.' },
  { values: [current, '', ''], message: 'Ingresa una nueva contraseña.' },
  { values: [current, next.slice(0, 7), next.slice(0, 7)], message: 'La nueva contraseña debe tener al menos 8 caracteres.' },
  { values: [current, next, ''], message: 'Confirma la nueva contraseña.' },
  { values: [current, next, current], message: 'Las contraseñas nuevas no coinciden.' },
])('valida campos antes de llamar al servidor: $message', async ({ values, message }) => {
  await render(<SeguridadView />);
  await fill(...values as [string, string, string]);
  await save();
  expect(screen.getByText(message)).toBeTruthy();
  expect(mockCambiarPassword).not.toHaveBeenCalled();
});

test.each([
  [400, 'La contraseña actual es incorrecta', 'La contraseña actual es incorrecta. Inténtalo nuevamente.'],
  [400, 'La contraseña debe tener mínimo 8 caracteres', 'La nueva contraseña debe tener al menos 8 caracteres.'],
  [400, 'Faltan datos', 'Completa la contraseña actual y la nueva contraseña.'],
  [401, 'No autorizado', 'Tu sesión ha expirado. Inicia sesión nuevamente.'],
  [500, 'Error interno', 'No pudimos cambiar tu contraseña. Inténtalo nuevamente.'],
] as const)('muestra error HTTP %i sin borrar campos ni confirmar éxito', async (status, body, message) => {
  mockCambiarPassword.mockRejectedValue(new HttpError(status, { error: body }, '/api/usuario/password'));
  await render(<SeguridadView />);
  await fill(); await save();
  expect(await screen.findByText(message)).toBeTruthy();
  expect(screen.getByLabelText('Contraseña actual').props.value).toBe(current);
  expect(screen.getByLabelText('Nueva contraseña').props.value).toBe(next);
  expect(screen.queryByText('Tu contraseña se actualizó correctamente.')).toBeNull();
});

test('un fallo de red mantiene los campos y ofrece reintentar', async () => {
  mockCambiarPassword.mockRejectedValue(new TypeError('Failed to fetch'));
  await render(<SeguridadView />);
  await fill(); await save();
  expect(await screen.findByText('No pudimos conectarnos. Revisa tu conexión e inténtalo nuevamente.')).toBeTruthy();
  expect(screen.getByLabelText('Confirmar nueva contraseña').props.value).toBe(next);
  expect(screen.queryByText('Tu contraseña se actualizó correctamente.')).toBeNull();
});

test('solo una respuesta confirmada limpia campos, oculta contraseñas y muestra éxito', async () => {
  let resolve!: () => void;
  mockCambiarPassword.mockImplementation(() => new Promise<void>((done) => { resolve = done; }));
  await render(<SeguridadView />);
  await fill();
  await fireEvent.press(screen.getByRole('button', { name: 'Mostrar contraseña actual' }));
  await save(); await save();
  expect(mockCambiarPassword).toHaveBeenCalledTimes(1);
  expect(mockCambiarPassword).toHaveBeenCalledWith(current, next);
  expect(screen.getByLabelText('Contraseña actual').props.value).toBe(current);
  resolve();
  await waitFor(() => expect(screen.getByText('Tu contraseña se actualizó correctamente.')).toBeTruthy());
  for (const label of ['Contraseña actual', 'Nueva contraseña', 'Confirmar nueva contraseña']) {
    expect(screen.getByLabelText(label).props.value).toBe('');
    expect(screen.getByLabelText(label).props.secureTextEntry).toBe(true);
  }
});
