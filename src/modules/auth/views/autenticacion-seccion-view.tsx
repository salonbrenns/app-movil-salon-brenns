import { Link } from 'expo-router';
import { View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { accountSectionStyles as styles } from '@/components/ui/account-section-styles';
import { CustomButton as Button } from '@/components/ui/button';
import { CustomInput as TextField } from '@/components/ui/text-field';
import { Touchable } from '@/components/ui/touchable';
import { StatusMessage } from '@/components/feedback/status-message';
import { useAutenticacionViewModel } from '../viewmodels/use-autenticacion-view-model';
import { CrearCuentaView } from './crear-cuenta-view';

export function AutenticacionSeccionView({ seccion }: { seccion: string }) {
  const vm = useAutenticacionViewModel(seccion);
  if (vm.section === 'crear-cuenta') return <CrearCuentaView model={vm} />;
  const messages = <>
    {vm.error ? <StatusMessage message={vm.error} /> : null}
    {vm.mensaje ? <StatusMessage message={vm.mensaje} tone="info" /> : null}
  </>;
  const login = <Link href={vm.loginHref} replace asChild><Button label="Volver a iniciar sesión" variant="secondary" disabled={vm.cargando} /></Link>;
  return <>
    {vm.section === 'cerrar-sesion' ? <ThemedView surface="card" style={styles.confirmation}>
      <ThemedText type="subtitle">¿Cerrar sesión?</ThemedText>
      <ThemedText type="small" themeColor="textSecondary">¿Estás segura de que deseas cerrar tu sesión?</ThemedText>
      {messages}
      <Button label="Cerrar sesión" loading={vm.cargando} onPress={() => { void vm.cerrarSesion(); }} />
      <Link href="/" asChild><Touchable disabled={vm.cargando} accessibilityRole="link" style={styles.centeredLink}><ThemedText type="label" themeColor="primary">Cancelar</ThemedText></Touchable></Link>
    </ThemedView> : null}
    {vm.section === 'verificar-email' ? <View style={styles.form}>
      {!vm.completado ? <>
        <ThemedText type="small" themeColor="textSecondary">{vm.tieneToken ? 'Confirma tu correo con el enlace que recibiste.' : 'Abre el enlace recibido por correo o solicita uno nuevo.'}</ThemedText>
        <Button label="Verificar correo" loading={vm.operacionPendiente === 'Verificación de correo'} disabled={!vm.tieneToken || vm.cargando} onPress={() => { void vm.verificarCorreo(); }} />
        <TextField label="Correo para reenviar verificación" value={vm.campos.correo} onChangeText={vm.cambiarCorreo} error={vm.erroresCampos.correo} editable={!vm.cargando} keyboardType="email-address" autoCapitalize="none" autoCorrect={false} autoComplete="email" returnKeyType="send" onSubmitEditing={() => { void vm.reenviarVerificacion(); }} />
        <Button label="Reenviar verificación" variant="secondary" loading={vm.operacionPendiente === 'Reenvío de verificación'} disabled={vm.cargando} onPress={() => { void vm.reenviarVerificacion(); }} />
      </> : null}
      {messages}
      {login}
    </View> : null}
  </>;
}
