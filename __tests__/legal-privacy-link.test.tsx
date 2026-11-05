import { render, screen, userEvent, waitFor } from '@testing-library/react-native';
import * as Linking from 'expo-linking';

import { LegalDocumentView } from '@/modules/legal/views/legal-document-view';

jest.mock('expo-linking', () => ({ openURL: jest.fn() }));
jest.mock('@/components/ui/text-link', () => {
  const React = jest.requireActual<typeof import('react')>('react');
  const { Text } = jest.requireActual<typeof import('react-native')>('react-native');
  return {
    TextLink: ({ label }: { label: string }) => React.createElement(Text, null, label),
  };
});

const openURL = Linking.openURL as jest.Mock;
const privacyUrl = 'https://brenns-sistema.vercel.app/privacidad-movil';

beforeEach(() => {
  openURL.mockReset();
});

test('el aviso de privacidad abre la página pública como enlace externo y conserva ARCO', async () => {
  openURL.mockResolvedValue(true);
  const user = userEvent.setup();
  await Promise.resolve(render(<LegalDocumentView documentKey="privacidad" />));
  expect(screen.getByText('Ejercer derechos ARCO')).toBeTruthy();
  await user.press(screen.getByRole('link', { name: 'Consultar aviso de privacidad completo' }));
  expect(openURL).toHaveBeenCalledWith(privacyUrl);
});

test('muestra la dirección copiable si no se puede abrir el navegador', async () => {
  openURL.mockRejectedValue(new Error('Navegador no disponible'));
  const user = userEvent.setup();
  await Promise.resolve(render(<LegalDocumentView documentKey="privacidad" />));
  await user.press(screen.getByRole('link', { name: 'Consultar aviso de privacidad completo' }));
  await waitFor(() => {
    expect(screen.getByText(/No se pudo abrir el aviso en el navegador/)).toBeTruthy();
  });
  expect(screen.getByText(privacyUrl).props.selectable).toBe(true);
});

test('el enlace público aparece solamente en privacidad', async () => {
  await Promise.resolve(render(<LegalDocumentView documentKey="terminos" />));
  expect(screen.queryByRole('link', { name: 'Consultar aviso de privacidad completo' })).toBeNull();
});
