import { Link, router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Icon, type IconName } from '@/components/ui/icon';
import { Screen } from '@/components/ui/screen';
import { CatalogCard, SearchField, SectionHeading } from '@/components/ui/style-guide';
import { Touchable } from '@/components/ui/touchable';
import { Colors, Radius, Shadows, Sizes, Spacing, Typography } from '@/theme';
import { useInicioViewModel } from '../viewmodels/use-inicio-view-model';
import { formatPrice } from '@/utils/format-price';

const accesos = [
  { title: 'Productos', icon: 'product', href: '/catalogo?categoria=Productos' },
  { title: 'Servicios', icon: 'service', href: '/catalogo?categoria=Servicios' },
  { title: 'Cursos', icon: 'course', href: '/catalogo?categoria=Cursos' },
  { title: 'Agenda', icon: 'agenda', href: '/agenda' },
] as const;

export default function InicioView() {
  const vm = useInicioViewModel();
  const [busqueda, setBusqueda] = useState('');
  const buscar = () => router.push({ pathname: '/catalogo', params: { q: busqueda.trim() } });

  return <Screen brand>
    <View style={styles.intro}>
      <ThemedText type="small" themeColor="textSecondary">{vm.autenticado ? vm.saludo : 'Hola'}</ThemedText>
      <ThemedText style={styles.headline} accessibilityRole="header">Bienvenida a Salón Brenn’s</ThemedText>
      <ThemedText type="small" themeColor="textSecondary">Tu espacio para cuidarte, aprender y sentirte bien.</ThemedText>
    </View>

    <SearchField placeholder="Buscar en el catálogo…" value={busqueda} onChangeText={setBusqueda} onSubmitEditing={buscar} />

    {vm.proximaCita ? <Link href="/agenda" push asChild><Touchable accessibilityRole="button" style={styles.appointment}>
      <ThemedText type="label" themeColor="primary">Tu próxima cita</ThemedText>
      <ThemedText type="small">{vm.proximaCita.servicioNombre} · {new Date(vm.proximaCita.fecha).toLocaleDateString('es-MX')} · {vm.proximaCita.hora}</ThemedText>
    </Touchable></Link> : null}

    <View style={styles.section}>
      <SectionHeading title="Explora Salón Brenn’s" />
      <View style={styles.grid}>
        {accesos.map((item) => <Link key={item.title} href={item.href} push asChild>
          <Touchable accessibilityRole="button" accessibilityLabel={item.title} style={styles.tile}>
            <View style={styles.iconBox}><Icon name={item.icon as IconName} size={24} color={Colors.primary} /></View>
            <ThemedText type="label">{item.title}</ThemedText>
            <Icon name="chevron-right" size={16} color={Colors.textSecondary} />
          </Touchable>
        </Link>)}
      </View>
    </View>
    {!vm.catalogo.cargando && !vm.catalogo.error ? <>
      {vm.catalogo.estado.datos.Servicios.length ? <View style={styles.section}>
        <SectionHeading title="Servicios destacados" href="/catalogo?categoria=Servicios" />
        {vm.catalogo.estado.datos.Servicios.slice(0, 3).map(item => <CatalogCard key={item.id} title={item.nombre} description={item.descripcion} price={formatPrice(item.precio)} kind="service" image={item.imagen} href={{ pathname: '/servicios', params: { id: item.id } }} />)}
      </View> : null}
      {vm.catalogo.estado.datos.Cursos.length ? <View style={styles.section}>
        <SectionHeading title="Cursos" href="/catalogo?categoria=Cursos" />
        {vm.catalogo.estado.datos.Cursos.slice(0, 2).map(item => <CatalogCard key={item.id} title={item.nombre} description={item.descripcion ?? undefined} price={formatPrice(item.precio)} kind="course" image={item.imagen} href={{ pathname: '/cursos', params: { id: item.id } }} />)}
      </View> : null}
      {vm.catalogo.estado.datos.Productos.length ? <View style={styles.section}>
        <SectionHeading title="Productos" href="/catalogo?categoria=Productos" />
        {vm.catalogo.estado.datos.Productos.slice(0, 2).map(item => <CatalogCard key={item.id} title={item.nombre} price={formatPrice(item.precio)} kind="product" image={item.imagen} href={{ pathname: '/productos/[id]', params: { id: item.id } }} />)}
      </View> : null}
    </> : null}
  </Screen>;
}

const styles = StyleSheet.create({
  intro: { gap: Spacing.two, paddingVertical: Spacing.two },
  headline: { ...Typography.title, color: Colors.text, maxWidth: 280 },
  section: { gap: Spacing.three },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  tile: { flexBasis: '48%', flexGrow: 1, minWidth: 145, minHeight: Sizes.categoryMinHeight, flexDirection: 'row', alignItems: 'center', gap: Spacing.two, padding: Spacing.three, backgroundColor: Colors.backgroundElement, borderColor: Colors.borderAccent, borderWidth: Sizes.borderWidth, borderRadius: Radius.card, ...Shadows.card },
  iconBox: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.primaryFaint },
  appointment: { gap: Spacing.one, padding: Spacing.three, backgroundColor: Colors.backgroundElement, borderColor: Colors.borderAccent, borderWidth: 1, borderRadius: Radius.card },
});
