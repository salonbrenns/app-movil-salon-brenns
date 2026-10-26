import { act, fireEvent, render, renderHook, screen, waitFor } from '@testing-library/react-native';
import * as Linking from 'expo-linking';

import { AccountDeletionView } from '@/modules/legal/views/account-deletion-view';
import { SupportContact } from '@/modules/legal/components/support-contact';
import { useArcoRequestViewModel } from '@/modules/legal/viewmodels/use-arco-request-view-model';
import { business } from '@/modules/legal/data/business';

jest.mock('expo-linking', () => ({ openURL: jest.fn() }));
jest.mock('@/theme', () => ({ Spacing: { three: 16 } }));
jest.mock('@/components/themed-text', () => ({
  ThemedText: jest.requireActual<typeof import('react-native')>('react-native').Text,
}));
jest.mock('@/components/ui/button', () => {
  const React = jest.requireActual<typeof import('react')>('react');
  const { Pressable, Text } = jest.requireActual<typeof import('react-native')>('react-native');
  return { Button: ({ label, onPress }: { label: string; onPress?: () => void }) =>
    React.createElement(Pressable, { accessibilityRole: 'button', accessibilityLabel: label, onPress }, React.createElement(Text, null, label)) };
});
const openURL = Linking.openURL as jest.Mock;

beforeEach(() => openURL.mockReset());

test('ARCO exige datos mínimos y sólo abre un borrador de correo codificado', () => {
  openURL.mockResolvedValue(undefined);
  return renderHook(useArcoRequestViewModel).then(async ({ result }) => {
    await act(async () => { await result.current.prepare(); });
    expect(result.current.validation).toContain('Completa nombre');
    expect(openURL).not.toHaveBeenCalled();

    await act(async () => {
      result.current.setName('Ana López');
      result.current.setEmail('ana@example.com');
      result.current.setRight('Acceso');
      result.current.setDescription('Consulta de mis citas');
    });
    await act(async () => { await result.current.prepare(); });
    expect(openURL).toHaveBeenCalledTimes(1);
    expect(openURL.mock.calls[0][0]).toContain('subject=Solicitud%20de%20derecho%20ARCO%3A%20Acceso');
    expect(openURL.mock.calls[0][0]).toContain('Ana%20L%C3%B3pez');
    expect(result.current.mailOpened).toBe(true);
  });
});

test('eliminación requiere confirmación y ofrece el correo copiable cuando no hay app de correo', () => {
  openURL.mockRejectedValue(new Error('No mail app'));
  return render(<AccountDeletionView />).then(async () => {
    expect(openURL).not.toHaveBeenCalled();
    await act(async () => { await fireEvent.press(screen.getByRole('button', { name: 'Solicitar eliminación de cuenta' })); });
    expect(screen.getByText('¿Deseas preparar una solicitud de eliminación?')).toBeTruthy();
    await act(async () => { await fireEvent.press(screen.getByRole('button', { name: 'Sí, preparar solicitud' })); });
    await waitFor(() => { expect(screen.getByText(/No se pudo abrir el correo/)).toBeTruthy(); });
    expect(screen.getByText(business.email).props.selectable).toBe(true);
    expect(openURL).toHaveBeenCalledTimes(1);
  });
});

test('soporte informa el fallo del correo y conserva la dirección copiable', () => {
  openURL.mockRejectedValue(new Error('No mail app'));
  return render(<SupportContact />).then(async () => {
    await fireEvent.press(screen.getByRole('button', { name: 'Contactar soporte' }));
    await waitFor(() => { expect(screen.getByText(/No se pudo abrir la aplicación de correo/)).toBeTruthy(); });
    expect(screen.getByText(business.email).props.selectable).toBe(true);
    expect(openURL).toHaveBeenCalledWith(`mailto:${business.email}`);
  });
});
