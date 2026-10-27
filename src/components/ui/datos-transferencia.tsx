import * as Clipboard from 'expo-clipboard';
import { useState } from 'react';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { StatusMessage } from '@/components/feedback/status-message';
import { Button } from './button';
import { InfoRow } from './style-guide';
import { accountSectionStyles as styles } from './account-section-styles';
import type { DatosBancarios } from '@/shared/models/transferencia';
export function DatosTransferencia({ datos }: { datos: DatosBancarios }) {
  const [copied, setCopied] = useState<string | null>(null);
  const { cuenta, clabe } = datos;
  const copy = async (label: string, value: string) => {
    try { await Clipboard.setStringAsync(value.replace(/\s/g, '')); setCopied(`${label} copiada.`); }
    catch { setCopied(`No se pudo copiar ${label.toLowerCase()}. Mantén presionado el dato para copiarlo.`); }
  };
  return <ThemedView surface="card" style={styles.section}>
    <ThemedText type="subtitle">Transferencia bancaria</ThemedText>
    <InfoRow label="Titular" value={datos.titular} /><InfoRow label="Banco" value={datos.banco} />
    {cuenta ? <><InfoRow label="Cuenta" value={cuenta} /><Button label="Copiar número de cuenta" variant="secondary" onPress={() => { void copy('Cuenta', cuenta); }} /></> : null}
    {clabe ? <><InfoRow label="CLABE" value={clabe} /><Button label="Copiar CLABE" variant="secondary" onPress={() => { void copy('CLABE', clabe); }} /></> : null}
    {datos.celular ? <InfoRow label="Celular" value={datos.celular} /> : null}
    {copied ? <StatusMessage message={copied} tone="info" /> : null}
    <ThemedText type="small" themeColor="textSecondary">Registrar tu solicitud no realiza una transferencia ni acredita el pago.</ThemedText>
  </ThemedView>;
}
