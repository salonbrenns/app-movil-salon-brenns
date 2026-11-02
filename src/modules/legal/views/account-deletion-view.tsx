import { View, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { TextField } from '@/components/ui/text-field';
import { business } from '../data/business';
import { useAccountDeletionViewModel } from '../viewmodels/use-account-deletion-view-model';
import { Spacing } from '@/theme';

export function AccountDeletionView() {
  const vm = useAccountDeletionViewModel();
  return <View style={styles.form}>
    {!vm.confirming ? <Button label="Solicitar eliminación de cuenta" onPress={vm.start} /> : <>
      <ThemedText type="label">¿Deseas preparar una solicitud de eliminación?</ThemedText>
      <ThemedText type="small">La cuenta podría dejar de dar acceso a citas, cursos y compras. El establecimiento verificará tu identidad, revisará la solicitud y podría conservar datos exigidos por ley. Te comunicará el resultado. Preparar este correo no elimina la cuenta ni cierra tu sesión.</ThemedText>
      <TextField label="Nombre del titular" value={vm.name} onChangeText={vm.setName} autoComplete="name" editable={!vm.mailBusy} />
      <TextField label="Correo de la cuenta" value={vm.email} onChangeText={vm.setEmail} keyboardType="email-address" autoCapitalize="none" autoComplete="email" editable={!vm.mailBusy} />
      <ThemedText type="small" themeColor="textSecondary">Revisa estos datos antes de preparar el mensaje. No escribas contraseñas ni adjuntes identificaciones oficiales.</ThemedText>
      {vm.validation ? <ThemedText accessibilityRole="alert" type="small">{vm.validation}</ThemedText> : null}
      <Button label="Sí, preparar solicitud" loading={vm.mailBusy} onPress={() => { void vm.prepare(); }} />
      <Button label="Conservar mi cuenta" variant="secondary" disabled={vm.mailBusy} onPress={vm.cancel} />
    </>}
    {vm.confirming && vm.mailOpened ? <ThemedText type="small" accessibilityLiveRegion="polite">{"Se abrió tu aplicación de correo. Revisa y envía el mensaje para presentar tu solicitud. Salón Brenn's deberá confirmar su recepción. Tu cuenta aún no se ha eliminado."}</ThemedText> : null}
    {vm.confirming && vm.mailError ? <>
      <ThemedText type="small" accessibilityRole="alert">No se pudo abrir una aplicación de correo. Copia la dirección y la solicitud para enviarlas manualmente desde otro servicio de correo.</ThemedText>
      <Button label="Copiar correo" variant="secondary" onPress={() => { void vm.copyEmail(); }} />
      <Button label="Copiar solicitud" variant="secondary" onPress={() => { void vm.copyRequest(); }} />
    </> : null}
    {vm.confirming && vm.copyError ? <ThemedText accessibilityRole="alert" type="small">No se pudo copiar. Selecciona la dirección y copia el texto manualmente.</ThemedText> : null}
    {vm.confirming && vm.copied ? <ThemedText accessibilityLiveRegion="polite" type="small">{vm.copied === 'email' ? 'Correo copiado.' : 'Solicitud copiada. Revisa su contenido antes de enviarla.'}</ThemedText> : null}
    <ThemedText selectable type="smallBold" themeColor="primary">{business.email}</ThemedText>
  </View>;
}

const styles = StyleSheet.create({ form: { gap: Spacing.three } });
