import { Image } from 'expo-image';
import { Link, router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Icon } from '@/components/ui/icon';
import { Screen } from '@/components/ui/screen';
import { SearchField, SectionHeading } from '@/components/ui/style-guide';
import { Touchable } from '@/components/ui/touchable';
import { Colors, Radius, Shadows, Sizes, Spacing, Typography } from '@/theme';
import { proximaCitaHorario } from '../viewmodels/proxima-cita';
import { useInicioViewModel } from '../viewmodels/use-inicio-view-model';

const categorias = [
  { title: 'Productos', description: 'Todo lo que necesitas para tus uñas.', icon: 'product', href: '/catalogo?categoria=Productos', image: require('../../../../assets/images/brenns-home-productos.png') },
  { title: 'Servicios', description: 'Manicuras, pedicuras, diseño y más.', icon: 'service', href: '/catalogo?categoria=Servicios', image: require('../../../../assets/images/brenns-home-servicios.png') },
  { title: 'Cursos', description: 'Aprende, perfecciona y haz crecer tu talento.', icon: 'course', href: '/catalogo?categoria=Cursos', image: require('../../../../assets/images/brenns-home-cursos.png') },
] as const;

export default function InicioView() {
  const vm = useInicioViewModel();
  const { width } = useWindowDimensions();
  const [busqueda, setBusqueda] = useState('');
  const buscar = () => router.push({ pathname: '/catalogo', params: { q: busqueda.trim() } });

  return <Screen>
    <View style={[styles.hero, { height: Math.min(224, Math.max(196, width * 0.55)) }]}>
      <Image source={require('../../../../assets/images/brenns-home-hero.png')} contentFit="cover" contentPosition="right center" style={styles.backgroundImage} />
      <View style={styles.heroWash} />
      <View style={styles.heroTop}>
        <ThemedText style={styles.greeting} numberOfLines={1}>{vm.saludo} <ThemedText style={styles.heart}>♥</ThemedText></ThemedText>
        <View style={styles.heroActions}>
          <Link href="/cuenta/favoritos" push asChild><Touchable accessibilityRole="button" accessibilityLabel="Favoritos" style={styles.roundAction}><Icon name="heart" color={Colors.primary} /></Touchable></Link>
          <Link href="/perfil" push asChild><Touchable accessibilityRole="button" accessibilityLabel="Perfil" style={styles.roundAction}><Icon name="profile" color={Colors.primary} /></Touchable></Link>
        </View>
      </View>
      <View style={styles.heroCopy}>
        <ThemedText style={styles.heroTitle} accessibilityRole="header">Bienvenida a{`\n`}<ThemedText style={styles.heroTitleAccent}>Salón Brenn’s</ThemedText></ThemedText>
        <ThemedText style={styles.heroSubtitle}>Tu espacio para cuidarte, aprender y sentirte bien.</ThemedText>
      </View>
    </View>

    <View style={styles.searchWrap}><SearchField placeholder="Buscar en el catálogo…" value={busqueda} onChangeText={setBusqueda} onSubmitEditing={buscar} /></View>

    <View style={styles.section}>
      <SectionHeading title="Explora Salón Brenn’s" />
      <View style={styles.categories}>
        {categorias.map((item, index) => <Link key={item.title} href={item.href} push asChild>
          <Touchable accessibilityRole="button" accessibilityLabel={item.title} style={StyleSheet.flatten([styles.categoryCard, index === 2 ? styles.categoryWide : undefined])}>
            <Image source={item.image} contentFit="cover" contentPosition="right center" style={styles.backgroundImage} />
            <View style={styles.categoryWash} />
            <View style={styles.categoryCopy}>
              <View style={styles.categoryIcon}><Icon name={item.icon} color={Colors.onPrimary} size={22} /></View>
              <ThemedText style={styles.categoryTitle} numberOfLines={2}>{item.title} ›</ThemedText>
              <ThemedText style={styles.categoryDescription} numberOfLines={3}>{item.description}</ThemedText>
            </View>
          </Touchable>
        </Link>)}
      </View>
    </View>

    <View style={styles.appointmentCard}>
      <Image source={require('../../../../assets/images/brenns-home-banner.png')} contentFit="cover" contentPosition="right center" style={styles.backgroundImage} />
      <View style={styles.appointmentWash} />
      <View style={styles.appointmentCopy}>
        <ThemedText style={styles.appointmentHeading} accessibilityRole="header">Tu próxima cita</ThemedText>
        {vm.status === 'loading' ? <ThemedText style={styles.appointmentDetail}>Preparando tus citas…</ThemedText>
          : vm.status === 'anonymous' ? <>
            <ThemedText style={styles.appointmentTitle}>Tus citas, en un solo lugar</ThemedText>
            <ThemedText style={styles.appointmentDetail}>Inicia sesión para ver tu próxima cita.</ThemedText>
            <Link href="/autenticacion" push asChild><Touchable accessibilityRole="button" accessibilityLabel="Iniciar sesión" style={styles.appointmentAction}><ThemedText style={styles.appointmentActionText}>Iniciar sesión ›</ThemedText></Touchable></Link>
          </> : vm.agenda.error ? <>
            <ThemedText style={styles.appointmentDetail}>{vm.agenda.error}</ThemedText>
            <Touchable accessibilityRole="button" accessibilityLabel="Reintentar citas" onPress={() => { void vm.agenda.recargar(); }} style={styles.appointmentAction}><ThemedText style={styles.appointmentActionText}>Reintentar ›</ThemedText></Touchable>
          </> : vm.agenda.cargando ? <ThemedText style={styles.appointmentDetail}>Consultando tus citas…</ThemedText>
          : vm.proximaCita ? <>
            <ThemedText style={styles.appointmentTitle} numberOfLines={2}>{vm.proximaCita.servicioNombre}</ThemedText>
            <ThemedText style={styles.appointmentDetail}>{proximaCitaHorario(vm.proximaCita)}</ThemedText>
            <Link href="/agenda" push asChild><Touchable accessibilityRole="button" accessibilityLabel="Ver mi cita" style={styles.appointmentAction}><ThemedText style={styles.appointmentActionText}>Ver mi cita ›</ThemedText></Touchable></Link>
          </> : <>
            <ThemedText style={styles.appointmentDetail}>Aún no tienes citas programadas</ThemedText>
            <Link href="/agenda" push asChild><Touchable accessibilityRole="button" accessibilityLabel="Agendar cita" style={styles.appointmentAction}><ThemedText style={styles.appointmentActionText}>Agendar cita ›</ThemedText></Touchable></Link>
          </>}
      </View>
    </View>

  </Screen>;
}

const styles = StyleSheet.create({
  hero: { marginHorizontal: -Spacing.four, marginTop: -Spacing.four, paddingHorizontal: Spacing.four, paddingTop: Spacing.two, paddingBottom: Spacing.three, overflow: 'hidden', backgroundColor: Colors.primaryFaint },
  backgroundImage: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 },
  heroWash: { position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(255,248,251,0.08)' },
  heroTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: Spacing.two },
  greeting: { ...Typography.smallBold, color: Colors.text, fontSize: 16, lineHeight: 22, flex: 1 },
  heart: { color: Colors.primary },
  heroActions: { flexDirection: 'row', gap: Spacing.two, flexShrink: 0 },
  roundAction: { width: Sizes.controlMinHeight, height: Sizes.controlMinHeight, borderRadius: Sizes.controlMinHeight / 2, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.86)', ...Shadows.control },
  heroCopy: { gap: Spacing.one, marginTop: Spacing.three, maxWidth: 218 },
  heroTitle: { ...Typography.title, color: Colors.text, fontSize: 25, lineHeight: 30 },
  heroTitleAccent: { color: Colors.primary },
  heroSubtitle: { ...Typography.small, color: Colors.text, fontSize: 12, lineHeight: 17, maxWidth: 204 },
  searchWrap: { marginTop: -Spacing.three, marginHorizontal: Spacing.two },
  section: { gap: Spacing.two },
  categories: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  categoryCard: { flexBasis: '47%', flexGrow: 1, minWidth: 116, minHeight: 148, padding: 12, borderRadius: 14, overflow: 'hidden', backgroundColor: Colors.primaryFaint, borderWidth: Sizes.borderWidth, borderColor: Colors.borderAccent, ...Shadows.card },
  categoryWide: { flexBasis: '100%', minHeight: 126 },
  categoryWash: { position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(255,248,251,0.64)' },
  categoryCopy: { flex: 1, justifyContent: 'space-between', alignItems: 'flex-start' },
  categoryIcon: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.primary },
  categoryTitle: { ...Typography.action, color: Colors.text, fontSize: 15, lineHeight: 20 },
  categoryDescription: { ...Typography.small, color: Colors.textSecondary, fontSize: 12, lineHeight: 16 },
  appointmentCard: { minHeight: 176, borderRadius: 14, overflow: 'hidden', backgroundColor: Colors.primarySoft, borderWidth: Sizes.borderWidth, borderColor: Colors.borderAccent, ...Shadows.card },
  appointmentWash: { position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(255,244,248,0.44)' },
  appointmentCopy: { minHeight: 176, padding: Spacing.three, gap: Spacing.two, alignItems: 'flex-start', justifyContent: 'center', maxWidth: '78%' },
  appointmentHeading: { ...Typography.smallBold, color: Colors.primary },
  appointmentTitle: { ...Typography.subtitle, color: Colors.text, fontSize: 17, lineHeight: 22 },
  appointmentDetail: { ...Typography.small, color: Colors.text, fontSize: 13, lineHeight: 18 },
  appointmentAction: { minHeight: Sizes.controlMinHeight, minWidth: Sizes.touchMinWidth, paddingHorizontal: Spacing.three, alignItems: 'center', justifyContent: 'center', borderRadius: Radius.control, backgroundColor: 'rgba(255,255,255,0.90)', borderWidth: Sizes.borderWidth, borderColor: Colors.borderAccent },
  appointmentActionText: { ...Typography.label, color: Colors.primary },
});
