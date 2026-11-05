import { render, screen, userEvent } from '@testing-library/react-native';
import { SeguridadView } from '@/modules/perfil/views/seguridad-view';

jest.mock('expo-router', () => ({ Link: ({ children }: { children: import('react').ReactNode }) => children }));
jest.mock('@/components/ui/style-guide', () => ({ MenuRow: () => null }));

test('cada contraseña de Seguridad alterna su visibilidad de forma independiente', async () => {
  const user = userEvent.setup();
  await render(<SeguridadView />);
  for (const label of ['Contraseña actual', 'Nueva contraseña', 'Confirmar nueva contraseña']) {
    expect(screen.getByLabelText(label).props.secureTextEntry).toBe(true);
  }
  await user.press(screen.getByRole('button', { name: 'Mostrar contraseña actual' }));
  expect(screen.getByLabelText('Contraseña actual').props.secureTextEntry).toBe(false);
  expect(screen.getByLabelText('Nueva contraseña').props.secureTextEntry).toBe(true);
  await user.press(screen.getByRole('button', { name: 'Mostrar nueva contraseña' }));
  await user.press(screen.getByRole('button', { name: 'Mostrar confirmar nueva contraseña' }));
  expect(screen.getByLabelText('Nueva contraseña').props.secureTextEntry).toBe(false);
  expect(screen.getByLabelText('Confirmar nueva contraseña').props.secureTextEntry).toBe(false);
  await user.press(screen.getByRole('button', { name: 'Ocultar contraseña actual' }));
  expect(screen.getByLabelText('Contraseña actual').props.secureTextEntry).toBe(true);
});
