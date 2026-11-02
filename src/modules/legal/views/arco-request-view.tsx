import { View, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { TextField } from '@/components/ui/text-field';
import { ChoiceChips } from '@/components/ui/style-guide';
import { business } from '../data/business';
import { ARCO_RIGHTS, type ArcoRight, useArcoRequestViewModel } from '../viewmodels/use-arco-request-view-model';
import { Spacing } from '@/theme';

const options = ARCO_RIGHTS.map((right) => ({ value: right, label: right }));

export function ArcoRequestView() {
  const vm = useArcoRequestViewModel();
  return <View style={styles.form}>
    <ThemedText type="subtitle">Preparar solicitud ARCO</ThemedText>
    <ThemedText type="small" themeColor="textSecondary">La aplicación sólo preparará un correo. Revísalo y envíalo desde tu dispositivo; no quedará registrado en la app ni se garantiza su recepción hasta que llegue al destinatario.</ThemedText>
    <TextField label="Nombre completo" value={vm.name} onChangeText={vm.setName} autoComplete="name" editable={!vm.mailBusy} />
    <TextField label="Correo para recibir respuesta" value={vm.email} onChangeText={vm.setEmail} keyboardType="email-address" autoCapitalize="none" autoComplete="email" editable={!vm.mailBusy} />
    <ThemedText type="label">Derecho que deseas ejercer</ThemedText>
    <ChoiceChips options={options} selected={vm.right} disabled={vm.mailBusy} onSelect={(value) => { vm.setRight(value as ArcoRight); }} />
    <TextField label={vm.right === 'Rectificación' ? 'Información que deseas corregir' : 'Descripción de la solicitud'} value={vm.description} onChangeText={vm.setDescription} multiline textAlignVertical="top" style={styles.multiline} editable={!vm.mailBusy} />
    <TextField label={vm.right === 'Acceso' ? 'Datos involucrados, si corresponde' : 'Datos personales involucrados'} value={vm.dataDetails} onChangeText={vm.setDataDetails} multiline textAlignVertical="top" style={styles.multiline} editable={!vm.mailBusy} />
    {vm.right === 'Rectificación' ? <>
      <TextField label="Cambio solicitado" value={vm.requestedChange} onChangeText={vm.setRequestedChange} multiline textAlignVertical="top" style={styles.multiline} editable={!vm.mailBusy} />
      <ThemedText type="small" themeColor="textSecondary">Para sustentar la rectificación podrían solicitarte documentación. El responsable deberá indicarte un medio seguro; no adjuntes identificaciones ni documentos sensibles desde esta pantalla.</ThemedText>
    </> : null}
    <ThemedText type="small" themeColor="textSecondary">No escribas contraseñas, datos bancarios ni números de identificación oficial. La verificación de identidad se acordará después por un medio seguro.</ThemedText>
    {vm.validation ? <ThemedText accessibilityRole="alert" themeColor="primary">{vm.validation}</ThemedText> : null}
    <Button label="Preparar solicitud ARCO" loading={vm.mailBusy} onPress={() => { void vm.prepare(); }} />
    {vm.mailOpened ? <ThemedText type="small" accessibilityLiveRegion="polite">{"Se abrió tu aplicación de correo. Revisa y envía el mensaje para presentar tu solicitud. Salón Brenn's deberá confirmar su recepción."}</ThemedText> : null}
    {vm.mailError ? <>
      <ThemedText type="small" accessibilityRole="alert">No se pudo abrir una aplicación de correo. Copia la dirección y la solicitud para enviarla manualmente desde otro servicio de correo.</ThemedText>
      <Button label="Copiar correo" variant="secondary" onPress={() => { void vm.copyEmail(); }} />
      <Button label="Copiar solicitud" variant="secondary" onPress={() => { void vm.copyRequest(); }} />
    </> : null}
    {vm.copyError ? <ThemedText accessibilityRole="alert" type="small">No se pudo copiar. Selecciona la dirección y copia el texto manualmente.</ThemedText> : null}
    {vm.copied ? <ThemedText accessibilityLiveRegion="polite" type="small">{vm.copied === 'email' ? 'Correo copiado.' : 'Solicitud copiada. Revisa su contenido antes de enviarla.'}</ThemedText> : null}
    <ThemedText selectable type="smallBold" themeColor="primary">{business.email}</ThemedText>
  </View>;
}

const styles = StyleSheet.create({ form: { gap: Spacing.three }, multiline: { minHeight: 104 } });
