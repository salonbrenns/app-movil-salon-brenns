import { Link } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { accountSectionStyles as styles } from '@/components/ui/account-section-styles';
import { CustomButton as Button } from '@/components/ui/button';
import { Touchable } from '@/components/ui/touchable';
import { StatusMessage } from '@/components/feedback/status-message';
import { useAutenticacionViewModel } from '../viewmodels/use-autenticacion-view-model';

export function AutenticacionSeccionView({ seccion }: { seccion: string }) {
  const vm = useAutenticacionViewModel(seccion);
  const messages = <>
    {vm.error ? <StatusMessage message={vm.error} /> : null}
    {vm.mensaje ? <StatusMessage message={vm.mensaje} tone="info" /> : null}
  </>;
  return <>
    {vm.section === 'cerrar-sesion' ? <ThemedView surface="card" style={styles.confirmation}>
      <ThemedText type="subtitle">¿Cerrar sesión?</ThemedText>
      <ThemedText type="small" themeColor="textSecondary">¿Estás segura de que deseas cerrar tu sesión?</ThemedText>
      {messages}
      <Button label="Cerrar sesión" loading={vm.cargando} onPress={() => { void vm.cerrarSesion(); }} />
      <Link href="/" asChild><Touchable disabled={vm.cargando} accessibilityRole="link" style={styles.centeredLink}><ThemedText type="label" themeColor="primary">Cancelar</ThemedText></Touchable></Link>
    </ThemedView> : null}
  </>;
}
