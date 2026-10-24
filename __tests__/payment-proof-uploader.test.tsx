import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import * as DocumentPicker from 'expo-document-picker';

import { PaymentProofUploader } from '@/components/ui/payment-proof-uploader';

jest.mock('expo-document-picker', () => ({
  getDocumentAsync: jest.fn(),
}));
jest.mock('@/components/themed-text', () => ({
  ThemedText: jest.requireActual<typeof import('react-native')>('react-native').Text,
}));
jest.mock('@/components/ui/button', () => {
  const React = jest.requireActual<typeof import('react')>('react');
  const { Pressable, Text } = jest.requireActual<typeof import('react-native')>('react-native');
  return { Button: ({ label, onPress, disabled }: { label: string; onPress?: () => void; disabled?: boolean }) =>
    React.createElement(Pressable,
      { accessibilityRole: 'button', accessibilityLabel: label, accessibilityState: { disabled: !!disabled }, disabled, onPress },
      React.createElement(Text, null, label)) };
});
jest.mock('@/components/feedback/status-message', () => ({
  StatusMessage: ({ message }: { message: string }) => {
    const React = jest.requireActual<typeof import('react')>('react');
    const { Text } = jest.requireActual<typeof import('react-native')>('react-native');
    return React.createElement(Text, null, message);
  },
}));
jest.mock('@/components/ui/account-section-styles', () => ({
  accountSectionStyles: { section: {} },
}));

const picker = DocumentPicker.getDocumentAsync as jest.Mock;
const proof = { name: 'pago.pdf', mimeType: 'application/pdf', size: 120, uri: 'file:///pago.pdf' };

beforeEach(() => { picker.mockReset(); });

test('selecciona, valida y confirma un comprobante después de que el servidor responde', async () => {
  picker.mockResolvedValue({ canceled: false, assets: [proof] });
  const upload = jest.fn().mockResolvedValue(undefined);
  await render(<PaymentProofUploader onUpload={upload} />);
  await act(async () => { fireEvent.press(screen.getByRole('button', { name: 'Seleccionar archivo' })); });
  await waitFor(() => expect(screen.getByText('pago.pdf')).toBeTruthy());
  await act(async () => { fireEvent.press(screen.getByRole('button', { name: 'Enviar comprobante' })); });
  await waitFor(() => expect(upload).toHaveBeenCalledWith(proof));
  await waitFor(() => expect(screen.getByText('Comprobante recibido por el servidor.')).toBeTruthy());
});

test('muestra errores de selección y envío, y permite reintentar', async () => {
  picker.mockResolvedValueOnce({ canceled: false, assets: [{ ...proof, name: 'falso.txt' }] })
    .mockResolvedValueOnce({ canceled: false, assets: [proof] });
  const upload = jest.fn().mockRejectedValueOnce(new Error('Error del servidor')).mockResolvedValueOnce(undefined);
  await render(<PaymentProofUploader onUpload={upload} />);
  await act(async () => { fireEvent.press(screen.getByRole('button', { name: 'Seleccionar archivo' })); });
  await waitFor(() => expect(screen.getByText(/Selecciona un archivo JPG/)).toBeTruthy());
  expect(screen.getByRole('button', { name: 'Enviar comprobante' }).props.accessibilityState.disabled).toBe(true);
  await act(async () => { fireEvent.press(screen.getByRole('button', { name: 'Seleccionar archivo' })); });
  await waitFor(() => expect(screen.getByText('pago.pdf')).toBeTruthy());
  await act(async () => { fireEvent.press(screen.getByRole('button', { name: 'Enviar comprobante' })); });
  await waitFor(() => expect(screen.getByText('Error del servidor')).toBeTruthy());
  await act(async () => { fireEvent.press(screen.getByRole('button', { name: 'Enviar comprobante' })); });
  await waitFor(() => expect(screen.getByText('Comprobante recibido por el servidor.')).toBeTruthy());
  expect(upload).toHaveBeenCalledTimes(2);
});
