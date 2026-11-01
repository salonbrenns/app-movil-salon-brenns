import { render, screen, userEvent } from '@testing-library/react-native';
import * as Clipboard from 'expo-clipboard';
import { DatosTransferencia } from '@/components/ui/datos-transferencia';

jest.mock('expo-clipboard', () => ({ setStringAsync: jest.fn(async () => {}) }));
jest.mock('@/components/ui/style-guide', () => ({ InfoRow: () => null }));

test('la transferencia del ticket conserva los datos completos y permite copiar CLABE', async () => {
  const clabe = '123456789012345678';
  const user = userEvent.setup();
  await render(<DatosTransferencia flat datos={{ banco: 'Banco', titular: 'Titular', cuenta: '1234567890', clabe, celular: null }} />);
  expect(screen.getByText(clabe).props.selectable).toBe(true);
  expect(screen.getByText('1234567890').props.selectable).toBe(true);
  await user.press(screen.getByRole('button', { name: 'Copiar CLABE' }));
  expect(Clipboard.setStringAsync).toHaveBeenCalledWith(clabe);
});
