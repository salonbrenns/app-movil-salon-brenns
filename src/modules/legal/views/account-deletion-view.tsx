import { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { business } from '../data/business';
import { useEmailDraft } from '../viewmodels/use-email-draft';
import { Spacing } from '@/theme';

export function AccountDeletionView() {
  const [confirming, setConfirming] = useState(false);
  const draft = useEmailDraft();
  return <View style={styles.form}>
    {!confirming ? <Button label="Solicitar eliminación de cuenta" onPress={() => { setConfirming(true); }} /> : <>
      <ThemedText type="label">¿Deseas preparar una solicitud de eliminación?</ThemedText>
      <ThemedText type="small">La cuenta podría dejar de dar acceso a citas, cursos y compras. El establecimiento revisará la solicitud y podría conservar los datos exigidos por ley. Esta acción abre tu aplicación de correo para que revises y envíes la solicitud.</ThemedText>
      <Button label="Sí, preparar solicitud" onPress={() => { void draft.open('Solicitud de eliminación de cuenta', 'Solicito la eliminación de mi cuenta de Salón Brenn\'s y la revisión de los datos personales asociados.\n\nCorreo de la cuenta: [escribir]\nNombre: [escribir]\n\nSolicito indicaciones para verificar mi identidad por un medio seguro.'); }} />
      <Button label="Conservar mi cuenta" variant="secondary" onPress={() => { setConfirming(false); }} />
    </>}
    {draft.opened ? <ThemedText type="small">Revisa y envía el correo. La solicitud aún no se ha recibido ni se ha eliminado tu cuenta.</ThemedText> : null}
    {draft.error ? <ThemedText type="small" accessibilityRole="alert">No se pudo abrir el correo. Mantén presionada la dirección para copiarla y envía tu solicitud manualmente.</ThemedText> : null}
    <ThemedText selectable type="smallBold" themeColor="primary">{business.email}</ThemedText>
  </View>;
}

const styles = StyleSheet.create({ form: { gap: Spacing.three } });
