import { Link } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Screen } from '@/components/ui/screen';
import { MenuRow } from '@/components/ui/style-guide';
import { LoadingState } from '@/components/feedback/async-states';
import { Colors, Radius, Spacing, Typography } from '@/theme';
import { useAuthSession } from '@/modules/auth/viewmodels/auth-session-provider';
import { usePerfilViewModel } from '@/modules/perfil/viewmodels/use-perfil-view-model';

export default function ProfileScreen() {
  const { session, status } = useAuthSession();
  const profile = usePerfilViewModel();
  const name = profile.perfil?.nombre?.trim() || session?.user.name?.trim() || 'Mi perfil';
  const initial = name.charAt(0).toLocaleUpperCase();

  if (status === 'loading') return <Screen title="Mi perfil"><LoadingState label="Cargando perfil…" /></Screen>;
  return <Screen title="Mi perfil">
    {status === 'authenticated' && session ? <>
      <View style={styles.identity}>
        <View style={styles.avatar}>{initial ? <ThemedText style={styles.initial}>{initial}</ThemedText> : <Icon name="profile" size={30} color={Colors.primary} />}</View>
        <View style={styles.identityCopy}>
          <ThemedText type="subtitle">{name}</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">{profile.perfil?.correo ?? session.user.email}</ThemedText>
        </View>
      </View>
      <View style={styles.menu}>
        <MenuRow label="Editar perfil" href="/cuenta/editar-perfil" icon="profile" compact />
        <MenuRow label="Mis compras" href="/cuenta/compras" icon="cart" compact />
        <MenuRow label="Mis cursos" href="/cuenta/cursos" icon="course" compact />
        <MenuRow label="Mis citas" href="/agenda" icon="agenda" compact />
        <MenuRow label="Favoritos" href="/cuenta/favoritos" icon="heart" compact />
        <MenuRow label="Direcciones" href="/cuenta/direcciones" icon="profile" compact />
        <MenuRow label="Configuración" href="/cuenta/configuracion" icon="settings" compact />
        <MenuRow label="Ayuda" href="/cuenta/ayuda" compact />
        <MenuRow label="Información legal" href="/cuenta/legal" compact />
        <MenuRow label="Acerca de la aplicación" href="/cuenta/acerca" compact />
        <MenuRow label="Cerrar sesión" href="/cuenta/cerrar-sesion" icon="profile" compact />
      </View>
    </> : <>
      <ThemedText themeColor="textSecondary">Inicia sesión para consultar tu perfil y tus actividades.</ThemedText>
      <Link href="/autenticacion" asChild><Button label="Iniciar sesión" /></Link>
    </>}
  </Screen>;
}

const styles = StyleSheet.create({
  identity: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three, paddingVertical: Spacing.two },
  avatar: { width: 64, height: 64, borderRadius: Radius.card + 14, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.primarySoft },
  initial: { ...Typography.subtitle, color: Colors.primary },
  identityCopy: { flex: 1, gap: Spacing.one },
  menu: { backgroundColor: Colors.backgroundElement, borderRadius: Radius.card, overflow: 'hidden' },
});
