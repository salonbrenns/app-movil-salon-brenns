import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import * as DocumentPicker from 'expo-document-picker';
import { Platform } from 'react-native';
import { prepararComprobante } from '@/shared/services/comprobante-service';

import { PaymentProofUploader } from '@/components/ui/payment-proof-uploader';

jest.mock('expo-document-picker', () => ({
  getDocumentAsync: jest.fn(),
}));
jest.mock('expo-image', () => {
  const React = jest.requireActual<typeof import('react')>('react');
  const { View } = jest.requireActual<typeof import('react-native')>('react-native');
  return { Image: ({ accessibilityLabel }: { accessibilityLabel: string }) => React.createElement(View, { accessibilityLabel }) };
});
jest.mock('@/shared/services/comprobante-service', () => ({
  comprobanteType: jest.requireActual<typeof import('@/shared/services/comprobante-service')>('@/shared/services/comprobante-service').comprobanteType,
  prepararComprobante: jest.fn(async (asset) => ({ asset, cleanup: jest.fn() })),
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
const prepare = prepararComprobante as jest.Mock;
const proof = { name: 'pago.pdf', mimeType: 'application/pdf', size: 120, uri: 'file:///pago.pdf' };

beforeEach(() => { picker.mockReset(); prepare.mockClear(); });

test('selecciona, valida y confirma un comprobante después de que el servidor responde', async () => {
  picker.mockResolvedValue({ canceled: false, assets: [proof] });
  const upload = jest.fn().mockResolvedValue(undefined);
  return render(<PaymentProofUploader onUpload={upload} />).then(async () => {
    await act(async () => { fireEvent.press(screen.getByRole('button', { name: 'Seleccionar archivo' })); });
    await waitFor(() => { expect(screen.getByText('pago.pdf')).toBeTruthy(); });
    expect(picker).toHaveBeenCalledWith(expect.objectContaining({ copyToCacheDirectory: Platform.OS !== 'android' }));
    expect(prepare).toHaveBeenCalledWith(proof);
    await act(async () => { fireEvent.press(screen.getByRole('button', { name: 'Enviar comprobante' })); });
    await waitFor(() => { expect(upload).toHaveBeenCalledWith(proof); });
    await waitFor(() => { expect(screen.getByText('Comprobante enviado correctamente.')).toBeTruthy(); });
  });
});

test('muestra errores de selección y envío, y permite reintentar', async () => {
  picker.mockResolvedValueOnce({ canceled: false, assets: [{ ...proof, name: 'falso.txt' }] })
    .mockResolvedValueOnce({ canceled: false, assets: [proof] });
  const staged = { ...proof, uri: 'file:///cache/comprobante/pago.pdf' };
  const cleanup = jest.fn();
  prepare.mockResolvedValueOnce({ asset: staged, cleanup });
  const upload = jest.fn().mockRejectedValueOnce(new Error('Error del servidor')).mockResolvedValueOnce(undefined);
  return render(<PaymentProofUploader onUpload={upload} />).then(async () => {
    await act(async () => { fireEvent.press(screen.getByRole('button', { name: 'Seleccionar archivo' })); });
    await waitFor(() => { expect(screen.getByText('Este formato de archivo no es compatible.')).toBeTruthy(); });
    expect(screen.getByRole('button', { name: 'Enviar comprobante' }).props.accessibilityState.disabled).toBe(true);
    await act(async () => { fireEvent.press(screen.getByRole('button', { name: 'Seleccionar archivo' })); });
    await waitFor(() => { expect(screen.getByText('pago.pdf')).toBeTruthy(); });
    await act(async () => { fireEvent.press(screen.getByRole('button', { name: 'Enviar comprobante' })); });
    await waitFor(() => { expect(screen.getByText('No pudimos subir tu comprobante. Inténtalo nuevamente.')).toBeTruthy(); });
    expect(cleanup).not.toHaveBeenCalled();
    await act(async () => { fireEvent.press(screen.getByRole('button', { name: 'Enviar comprobante' })); });
    await waitFor(() => { expect(screen.getByText('Comprobante enviado correctamente.')).toBeTruthy(); });
    expect(upload).toHaveBeenCalledTimes(2);
    expect(upload).toHaveBeenNthCalledWith(1, staged);
    expect(upload).toHaveBeenNthCalledWith(2, staged);
    expect(cleanup).toHaveBeenCalledTimes(1);
  });
});

test('previsualiza una imagen, permite reemplazarla y quitarla antes del envío', async () => {
  const first = { ...proof, name: 'primero.jpg', mimeType: 'image/jpeg', uri: 'file:///primero.jpg' };
  const second = { ...first, name: 'segundo.jpg', uri: 'file:///segundo.jpg' };
  const firstCleanup = jest.fn();
  const secondCleanup = jest.fn();
  picker.mockResolvedValueOnce({ canceled: false, assets: [first] }).mockResolvedValueOnce({ canceled: false, assets: [second] });
  prepare.mockResolvedValueOnce({ asset: first, cleanup: firstCleanup }).mockResolvedValueOnce({ asset: second, cleanup: secondCleanup });
  const upload = jest.fn();
  return render(<PaymentProofUploader onUpload={upload} />).then(async () => {
    await act(async () => { fireEvent.press(screen.getByRole('button', { name: 'Seleccionar archivo' })); });
    expect(screen.getByText('primero.jpg')).toBeTruthy();
    expect(screen.getByLabelText('Vista previa del comprobante')).toBeTruthy();
    await act(async () => { fireEvent.press(screen.getByRole('button', { name: 'Reemplazar archivo' })); });
    expect(firstCleanup).toHaveBeenCalledTimes(1);
    expect(screen.getByText('segundo.jpg')).toBeTruthy();
    await act(async () => { fireEvent.press(screen.getByRole('button', { name: 'Quitar archivo' })); });
    expect(secondCleanup).toHaveBeenCalledTimes(1);
    expect(screen.queryByText('segundo.jpg')).toBeNull();
    expect(screen.getByRole('button', { name: 'Enviar comprobante' }).props.accessibilityState.disabled).toBe(true);
    expect(upload).not.toHaveBeenCalled();
  });
});
