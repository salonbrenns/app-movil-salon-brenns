import * as DocumentPicker from 'expo-document-picker';
import { Image } from 'expo-image';
import { useEffect, useRef, useState } from 'react';
import { Platform, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { Button } from './button';
import { StatusMessage } from '@/components/feedback/status-message';
import { accountSectionStyles as styles } from './account-section-styles';
import { comprobanteType, prepararComprobante } from '@/shared/services/comprobante-service';

export function PaymentProofUploader({ onUpload, disabled = false }: { onUpload: (asset: DocumentPicker.DocumentPickerAsset) => Promise<void>; disabled?: boolean }) {
  const [asset, setAsset] = useState<DocumentPicker.DocumentPickerAsset | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [picking, setPicking] = useState(false);
  const [sent, setSent] = useState(false);
  const inFlight = useRef(false);
  const mounted = useRef(true);
  const releaseProof = useRef<(() => void) | null>(null);

  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; if (!inFlight.current) releaseProof.current?.(); };
  }, []);

  function clearProof() {
    releaseProof.current?.();
    releaseProof.current = null;
  }

  async function pick() {
    if (inFlight.current || disabled) return;
    inFlight.current = true;
    setPicking(true);
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf'], copyToCacheDirectory: Platform.OS !== 'android', multiple: false });
      if (result.canceled || !result.assets[0]) return;
      comprobanteType(result.assets[0]);
      const prepared = await prepararComprobante(result.assets[0]);
      if (!mounted.current) { prepared.cleanup(); return; }
      clearProof();
      releaseProof.current = prepared.cleanup;
      setAsset(prepared.asset);
      setError(null);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'No se pudo seleccionar el archivo.');
    } finally {
      inFlight.current = false;
      if (!mounted.current) clearProof();
      setPicking(false);
    }
  }

  async function submit() {
    if (!asset || inFlight.current || disabled) return;
    inFlight.current = true;
    setBusy(true); setError(null);
    try { await onUpload(asset); clearProof(); setAsset(null); setSent(true); }
    catch (reason) { setError(reason instanceof Error ? reason.message : 'No se pudo subir el comprobante.'); }
    finally { inFlight.current = false; if (!mounted.current) clearProof(); setBusy(false); }
  }

  return <View style={styles.section}>
    <ThemedText type="label">Adjuntar comprobante de pago</ThemedText>
    {sent ? <StatusMessage message="Comprobante enviado correctamente." tone="success" /> : <>
      <ThemedText type="small" themeColor="textSecondary">JPG, PNG, WEBP, GIF o PDF · máximo 10 MB.</ThemedText>
      <Button label={asset ? 'Reemplazar archivo' : 'Seleccionar archivo'} variant="secondary" disabled={disabled || busy || picking} onPress={() => { void pick(); }} />
      {asset ? <>
        {comprobanteType(asset).startsWith('image/') ? <Image source={{ uri: asset.uri }} style={{ width: '100%', height: 200 }} contentFit="contain" accessibilityLabel="Vista previa del comprobante" /> : null}
        <ThemedText type="small">{asset.name}</ThemedText>
        <Button label="Quitar archivo" variant="secondary" disabled={busy || picking} onPress={() => { clearProof(); setAsset(null); setError(null); }} />
      </> : null}
      {error ? <StatusMessage message={error} /> : null}
      <Button label="Enviar comprobante" disabled={disabled || busy || picking || !asset} loading={busy} onPress={() => { void submit(); }} />
    </>}
  </View>;
}
