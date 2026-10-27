import { StyleSheet, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Screen } from '@/components/ui/screen';
import { InfoRow, MediaPlaceholder } from '@/components/ui/style-guide';
import { InscripcionForm } from './inscripcion-form';
import { EmptyState, ErrorState, LoadingState } from '@/components/feedback/async-states';
import { Spacing } from '@/theme';
import { useCursosViewModel } from '@/modules/cursos/viewmodels/use-cursos-view-model';
import { CatalogContent } from '@/modules/catalogo/views/catalogo-view';
import { useFavoriteAction } from '@/modules/favoritos/viewmodels/use-favorite-action';
import { FavoriteButton } from '@/components/ui/favorite-button';
import { ResourceStatus } from '@/components/feedback/resource-status';
import type { Curso } from '@/modules/cursos/models/curso';

export default function CoursesScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { curso, informacion, precio, cargando, error, recargar } = useCursosViewModel(id);

  if (!curso) {
    if (!id) return <CatalogContent categoriaInicial="Cursos" title="Cursos" hideCategory backHref="/catalogo" />;
    return <Screen title="Curso" backHref="/catalogo"><>{cargando ? <LoadingState label="Cargando curso…" /> : null}{!cargando && error ? <ErrorState message={error} onRetry={recargar} /> : null}{!cargando && !error ? <EmptyState title="Curso no disponible" description="Vuelve al catálogo para explorar cursos." /> : null}</></Screen>;
  }

  return <CourseDetail curso={curso} informacion={informacion} precio={precio} />;
}

function CourseDetail({ curso, informacion, precio }: { curso: Curso; informacion: readonly { label: string; value: string }[]; precio: string }) {
  const favorite = useFavoriteAction('Cursos', curso.id);
  return (
    <Screen title="Curso" backHref="/catalogo">
      <MediaPlaceholder label={curso.nombre} source={curso.imagen} detail />
      <View style={styles.heading}>
        <View style={styles.headingRow}>
          <ThemedText type="title" accessibilityRole="header" style={styles.title}>{curso.nombre}</ThemedText>
          <FavoriteButton title={curso.nombre} selected={favorite.selected} disabled={favorite.authenticated && (favorite.cargando || !!favorite.error)} busy={favorite.ocupado} onPress={favorite.toggle} />
        </View>
        {curso.descripcion ? <ThemedText themeColor="textSecondary">{curso.descripcion}</ThemedText> : null}
      </View>
      <ResourceStatus {...favorite} cargando={false} />
      <View style={styles.details}>
        {informacion.map((item) => <InfoRow key={item.label} {...item} />)}
      </View>
      <ThemedView surface="card"><InfoRow label="Precio" value={precio} accent /></ThemedView>
      <InscripcionForm curso={curso} />
    </Screen>
  );
}

const styles = StyleSheet.create({ heading: { gap: Spacing.two }, headingRow: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.two }, title: { flex: 1, minWidth: 0 }, details: { gap: Spacing.three } });
