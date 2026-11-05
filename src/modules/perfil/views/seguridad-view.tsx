import { View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { CustomInput } from '@/components/ui/text-field';
import { MenuRow } from '@/components/ui/style-guide';
import { StatusMessage } from '@/components/feedback/status-message';
import { accountSectionStyles as styles } from '@/components/ui/account-section-styles';
import { useSeguridadViewModel } from '../viewmodels/use-seguridad-view-model';

export function SeguridadView() {
  const vm = useSeguridadViewModel();
  return <View style={styles.form}>
    <ThemedText type="subtitle">Cambiar contraseña</ThemedText>
    <CustomInput label="Contraseña actual" value={vm.actual} onChangeText={vm.setActual} secureTextEntry={!vm.visibilidad.actual} onTogglePassword={() => { vm.alternarVisibilidad('actual'); }} editable={!vm.ocupado} autoComplete="current-password" />
    <CustomInput label="Nueva contraseña" value={vm.nueva} onChangeText={vm.setNueva} secureTextEntry={!vm.visibilidad.nueva} onTogglePassword={() => { vm.alternarVisibilidad('nueva'); }} editable={!vm.ocupado} autoComplete="new-password" />
    <CustomInput label="Confirmar nueva contraseña" value={vm.confirmacion} onChangeText={vm.setConfirmacion} secureTextEntry={!vm.visibilidad.confirmacion} onTogglePassword={() => { vm.alternarVisibilidad('confirmacion'); }} editable={!vm.ocupado} autoComplete="new-password" />
    {vm.error ? <StatusMessage message={vm.error} /> : null}
    {vm.guardado ? <StatusMessage message="Tu contraseña se actualizó correctamente." tone="success" /> : null}
    <Button label="Guardar contraseña" disabled={vm.ocupado} loading={vm.ocupado} onPress={() => { void vm.guardar(); }} />
    <MenuRow label="Solicitar eliminación de cuenta" href="/cuenta/eliminar-cuenta" destructive />
  </View>;
}
