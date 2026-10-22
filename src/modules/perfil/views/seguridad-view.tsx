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
    <CustomInput label="Contraseña actual" value={vm.actual} onChangeText={vm.setActual} secureTextEntry editable={!vm.ocupado} autoComplete="current-password" />
    <CustomInput label="Nueva contraseña" value={vm.nueva} onChangeText={vm.setNueva} secureTextEntry editable={!vm.ocupado} autoComplete="new-password" />
    <CustomInput label="Confirmar nueva contraseña" value={vm.confirmacion} onChangeText={vm.setConfirmacion} secureTextEntry editable={!vm.ocupado} autoComplete="new-password" />
    {vm.error ? <StatusMessage message={vm.error} /> : null}
    {vm.guardado ? <StatusMessage message="Contraseña actualizada." tone="success" /> : null}
    <Button label="Guardar contraseña" disabled={vm.ocupado} loading={vm.ocupado} onPress={() => { void vm.guardar(); }} />
    <MenuRow label="Eliminar cuenta" href="/cuenta/eliminar-cuenta" destructive />
  </View>;
}
