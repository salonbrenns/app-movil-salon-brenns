import { render, screen, userEvent } from '@testing-library/react-native';

import AutenticacionView from '@/modules/auth/views/autenticacion-view';
import { useAutenticacionViewModel } from '@/modules/auth/viewmodels/use-autenticacion-view-model';
import { Screen } from '@/components/ui/screen';

jest.mock('expo-router', () => {
  return { Link: ({ children }: { children: import('react').ReactNode }) => children };
});
jest.mock('@/components/ui/screen', () => {
  const React = jest.requireActual<typeof import('react')>('react');
  const { View } = jest.requireActual<typeof import('react-native')>('react-native');
  return { Screen: jest.fn(({ children }) => React.createElement(View, null, children)) };
});
jest.mock('@/modules/auth/viewmodels/use-autenticacion-view-model', () => ({ useAutenticacionViewModel: jest.fn() }));

test('iniciar sesión usa un placeholder legible y enlaza el ojo sin cambiar la autenticación', async () => {
  const alternarVisibilidad = jest.fn();
  const vm = {
    campos: { correo: '', password: '' }, erroresCampos: {}, cargando: false,
    visibilidad: { password: false }, error: null, mensaje: null,
    correoVerificacion: null, operacionPendiente: null,
    cambiarCorreo: jest.fn(), cambiarPassword: jest.fn(), alternarVisibilidad,
    iniciarSesion: jest.fn(), reenviarVerificacion: jest.fn(), registroHref: '/cuenta/crear-cuenta',
  };
  (useAutenticacionViewModel as jest.Mock).mockReturnValue(vm);
  const rendered = await render(<AutenticacionView />);
  expect(Screen).toHaveBeenCalledWith(expect.objectContaining({
    title: 'Bienvenida de nuevo', subtitle: 'Inicia sesión para continuar',
  }), undefined);
  expect((Screen as jest.Mock).mock.calls[0][0].brand).toBeUndefined();
  expect(screen.getByLabelText('Correo electrónico')).toBeTruthy();
  expect(screen.getByLabelText('Contraseña').props).toMatchObject({ placeholder: 'Tu contraseña', secureTextEntry: true });
  expect(screen.queryByPlaceholderText('••••••••')).toBeNull();
  await userEvent.setup().press(screen.getByRole('button', { name: 'Mostrar contraseña' }));
  expect(alternarVisibilidad).toHaveBeenCalledWith('password');
  (useAutenticacionViewModel as jest.Mock).mockReturnValue({ ...vm, visibilidad: { password: true } });
  await rendered.rerender(<AutenticacionView />);
  expect(screen.getByLabelText('Contraseña').props.secureTextEntry).toBe(false);
  expect(screen.getByRole('button', { name: 'Ocultar contraseña' })).toBeTruthy();
  expect(screen.getByRole('button', { name: 'Iniciar sesión' })).toBeTruthy();
  expect(screen.getByText('¿Olvidaste tu contraseña?')).toBeTruthy();
  expect(screen.getByText('Crear cuenta')).toBeTruthy();
});
