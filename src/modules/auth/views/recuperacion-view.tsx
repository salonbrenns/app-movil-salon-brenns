import { Link } from 'expo-router';
import { View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { CustomInput } from '@/components/ui/text-field';
import { StatusMessage } from '@/components/feedback/status-message';
import { accountSectionStyles as styles } from '@/components/ui/account-section-styles';
import { useRecuperacionViewModel } from '../viewmodels/use-recuperacion-view-model';

export function RecuperacionView({ token, nueva = false }: { token?: string; nueva?: boolean }) {
  const vm = useRecuperacionViewModel(token);
  return <View style={styles.form}>
    {nueva ? <>
      <ThemedText type="small" themeColor="textSecondary">Crea una contraseña para tu cuenta desde el enlace de recuperación.</ThemedText>
      <CustomInput label="Nueva contraseña" value={vm.password} onChangeText={vm.setPassword} secureTextEntry={!vm.visible} onTogglePassword={() => { vm.setVisible(!vm.visible); }} autoComplete="new-password" editable={!vm.ocupado} />
      <CustomInput label="Confirmar contraseña" value={vm.confirmacion} onChangeText={vm.setConfirmacion} secureTextEntry={!vm.visible} autoComplete="new-password" editable={!vm.ocupado} />
      {vm.error ? <StatusMessage message={vm.error} /> : null}
      {vm.enviado ? <StatusMessage message="Contraseña actualizada. Ya puedes iniciar sesión." tone="success" /> : <Button label="Guardar contraseña" loading={vm.ocupado} disabled={vm.ocupado || !token} onPress={vm.guardar} />}
    </> : <>
      <ThemedText type="small" themeColor="textSecondary">Recibirás un enlace para restablecer tu contraseña si el correo corresponde a una cuenta.</ThemedText>
      <CustomInput label="Correo electrónico" value={vm.correo} onChangeText={vm.setCorreo} keyboardType="email-address" autoCapitalize="none" autoComplete="email" editable={!vm.ocupado} />
      {vm.error ? <StatusMessage message={vm.error} /> : null}
      {vm.enviado ? <StatusMessage message="Solicitud recibida. Revisa tu correo y sigue el enlace enviado." tone="info" /> : <Button label="Enviar enlace" loading={vm.ocupado} disabled={vm.ocupado} onPress={vm.solicitar} />}
    </>}
    <Link href="/autenticacion" asChild><Button label="Volver a iniciar sesión" variant="secondary" /></Link>
  </View>;
}
