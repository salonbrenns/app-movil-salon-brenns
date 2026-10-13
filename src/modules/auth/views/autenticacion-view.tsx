import { useRef } from 'react';
import { Link } from 'expo-router';
import { View, type TextInput } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { CustomButton as Button } from '@/components/ui/button';
import { Screen } from '@/components/ui/screen';
import { AppFooter } from '@/components/layout/app-footer';
import { CustomInput as TextField } from '@/components/ui/text-field';
import { StatusMessage } from '@/components/feedback/status-message';
import { useAutenticacionViewModel } from '@/modules/auth/viewmodels/use-autenticacion-view-model';
import { accountSectionStyles as formStyles } from '@/components/ui/account-section-styles';

export default function AutenticacionView() {
  const vm = useAutenticacionViewModel();
  const password = useRef<TextInput>(null);
  return (
    <Screen brand title="Bienvenida de nuevo" subtitle="Inicia sesión para continuar">
      <View style={formStyles.form}>
        <TextField label="Correo electrónico" value={vm.campos.correo} onChangeText={vm.cambiarCorreo} error={vm.erroresCampos.correo} editable={!vm.cargando} placeholder="Tu correo electrónico" keyboardType="email-address" autoCapitalize="none" autoCorrect={false} autoComplete="email" returnKeyType="next" onSubmitEditing={() => password.current?.focus()} />
        <TextField ref={password} label="Contraseña" value={vm.campos.password} onChangeText={vm.cambiarPassword} error={vm.erroresCampos.password} editable={!vm.cargando} placeholder="••••••••" secureTextEntry={!vm.visibilidad.password} onTogglePassword={() => vm.alternarVisibilidad('password')} autoCapitalize="none" autoCorrect={false} autoComplete="current-password" returnKeyType="go" onSubmitEditing={() => { void vm.iniciarSesion(); }} />
        {vm.error ? <StatusMessage message={vm.error} /> : null}
        <Button label="Iniciar sesión" disabled={vm.cargando} loading={vm.operacionPendiente === 'Acceso'} onPress={() => { void vm.iniciarSesion(); }} />
        {vm.mensaje ? <StatusMessage message={vm.mensaje} tone="info" /> : null}
      </View>
      <AppFooter><ThemedText type="auxiliary" themeColor="textSecondary">Al continuar aceptas nuestros Términos y Aviso de privacidad.</ThemedText></AppFooter>
      <Link href="/" dismissTo asChild><Button label="Volver al inicio" variant="secondary" /></Link>
    </Screen>
  );
}
