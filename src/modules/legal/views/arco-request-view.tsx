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
    <TextField label="Nombre completo" value={vm.name} onChangeText={vm.setName} autoComplete="name" />
    <TextField label="Correo para recibir respuesta" value={vm.email} onChangeText={vm.setEmail} keyboardType="email-address" autoCapitalize="none" autoComplete="email" />
    <ThemedText type="label">Derecho que deseas ejercer</ThemedText>
    <ChoiceChips options={options} selected={vm.right} onSelect={(value) => vm.setRight(value as ArcoRight)} />
    <TextField label="Descripción de la solicitud" value={vm.description} onChangeText={vm.setDescription} multiline textAlignVertical="top" style={styles.multiline} />
    <TextField label="Datos involucrados, si corresponde" value={vm.dataDetails} onChangeText={vm.setDataDetails} multiline textAlignVertical="top" style={styles.multiline} />
    {vm.validation ? <ThemedText accessibilityRole="alert" themeColor="primary">{vm.validation}</ThemedText> : null}
    <Button label="Preparar solicitud ARCO" onPress={() => { void vm.prepare(); }} />
    {vm.mailOpened ? <ThemedText type="small">El correo se abrió para que revises y envíes la solicitud. La app no confirma su envío ni recepción.</ThemedText> : null}
    {vm.mailError ? <ThemedText type="small" accessibilityRole="alert">No se pudo abrir una aplicación de correo. Mantén presionada esta dirección para copiarla y envía tu solicitud manualmente:</ThemedText> : null}
    <ThemedText selectable type="smallBold" themeColor="primary">{business.email}</ThemedText>
  </View>;
}

const styles = StyleSheet.create({ form: { gap: Spacing.three }, multiline: { minHeight: 104 } });
