import * as DocumentPicker from 'expo-document-picker';
import { useRef, useState } from 'react';
import { View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { Button } from './button';
import { StatusMessage } from '@/components/feedback/status-message';
import { accountSectionStyles as styles } from './account-section-styles';
import { comprobanteType } from '@/shared/services/comprobante-service';

export function PaymentProofUploader({ onUpload, disabled = false }: { onUpload: (asset: DocumentPicker.DocumentPickerAsset) => Promise<void>; disabled?: boolean }) {
  const [asset, setAsset] = useState<DocumentPicker.DocumentPickerAsset | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [picking, setPicking] = useState(false);
  const [sent, setSent] = useState(false);
  const inFlight = useRef(false);

  async function pick() {
    if (inFlight.current || disabled) return;
    inFlight.current = true;
    setPicking(true);
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf'], copyToCacheDirectory: true, multiple: false });
      if (result.canceled || !result.assets[0]) return;
      setAsset(null);
      comprobanteType(result.assets[0]);
      setAsset(result.assets[0]);
      setError(null);
    } catch (reason) {
      setAsset(null);
      setError(reason instanceof Error ? reason.message : 'No se pudo seleccionar el archivo.');
    } finally {
      inFlight.current = false;
      setPicking(false);
    }
  }

  async function submit() {
    if (!asset || inFlight.current || disabled) return;
    inFlight.current = true;
    setBusy(true); setError(null);
    try { await onUpload(asset); setSent(true); }
    catch (reason) { setError(reason instanceof Error ? reason.message : 'No se pudo subir el comprobante.'); }
    finally { inFlight.current = false; setBusy(false); }
  }

  return <View style={styles.section}>
    <ThemedText type="label">Comprobante de transferencia</ThemedText>
    {sent ? <StatusMessage message="Comprobante recibido por el servidor." tone="success" /> : <>
      <ThemedText type="small" themeColor="textSecondary">JPG, PNG, WEBP, GIF o PDF · máximo 10 MB.</ThemedText>
      <Button label={asset ? 'Reemplazar archivo' : 'Seleccionar archivo'} variant="secondary" disabled={disabled || busy || picking} onPress={() => { void pick(); }} />
      {asset ? <ThemedText type="small">{asset.name}</ThemedText> : null}
      {error ? <StatusMessage message={error} /> : null}
      <Button label="Enviar comprobante" disabled={disabled || busy || picking || !asset} loading={busy} onPress={() => { void submit(); }} />
    </>}
  </View>;
}
