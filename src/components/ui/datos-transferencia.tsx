import * as Clipboard from 'expo-clipboard';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { StatusMessage } from '@/components/feedback/status-message';
import { Button } from './button';
import { Touchable } from './touchable';
import { InfoRow } from './style-guide';
import { accountSectionStyles as sectionStyles } from './account-section-styles';
import { Colors, Spacing } from '@/theme';
import type { DatosBancarios } from '@/shared/models/transferencia';
export function DatosTransferencia({ datos, flat = false }: { datos: DatosBancarios; flat?: boolean }) {
  const [copied, setCopied] = useState<string | null>(null);
  const { cuenta, clabe } = datos;
  const copy = async (label: string, value: string) => {
    try { await Clipboard.setStringAsync(value.replace(/\s/g, '')); setCopied(`${label} copiada.`); }
    catch { setCopied(`No se pudo copiar ${label.toLowerCase()}. Mantén presionado el dato para copiarlo.`); }
  };
  const detail = (label: string, value: string) => flat
    ? <View style={styles.row}><ThemedText type="smallBold" themeColor="textSecondary">{label}</ThemedText><ThemedText selectable style={styles.value}>{value}</ThemedText></View>
    : <InfoRow label={label} value={value} />;
  const copyAction = (label: string, value: string, buttonLabel: string) => flat
    ? <Touchable accessibilityRole="button" accessibilityLabel={buttonLabel} onPress={() => { void copy(label, value); }} style={styles.copyAction}><ThemedText type="label" themeColor="primary">{buttonLabel}</ThemedText></Touchable>
    : <Button label={buttonLabel} variant="secondary" onPress={() => { void copy(label, value); }} />;
  return <ThemedView surface={flat ? undefined : 'card'} style={sectionStyles.section}>
    <ThemedText type="subtitle">Transferencia bancaria</ThemedText>
    {detail('Titular', datos.titular)}{detail('Banco', datos.banco)}
    {cuenta ? <>{detail('Cuenta', cuenta)}{copyAction('Cuenta', cuenta, 'Copiar número de cuenta')}</> : null}
    {clabe ? <>{detail('CLABE', clabe)}{copyAction('CLABE', clabe, 'Copiar CLABE')}</> : null}
    {datos.celular ? detail('Celular', datos.celular) : null}
    {copied ? <StatusMessage message={copied} tone="info" /> : null}
    <ThemedText type="small" themeColor="textSecondary">Registrar tu solicitud no realiza una transferencia ni acredita el pago.</ThemedText>
  </ThemedView>;
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: Spacing.two },
  value: { flexShrink: 1, maxWidth: '70%', textAlign: 'right', color: Colors.text },
  copyAction: { alignSelf: 'flex-end', minHeight: 44, justifyContent: 'center', paddingHorizontal: Spacing.two },
});
