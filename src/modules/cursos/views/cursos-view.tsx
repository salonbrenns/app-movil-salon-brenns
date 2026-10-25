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

export default function CoursesScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { curso, informacion, precio, cargando, error, recargar } = useCursosViewModel(id);

  if (!curso) {
    if (!id) return <CatalogContent categoriaInicial="Cursos" title="Cursos" hideCategory backHref="/catalogo" />;
    return <Screen title="Curso" backHref="/catalogo"><>{cargando ? <LoadingState label="Cargando curso…" /> : null}{!cargando && error ? <ErrorState message={error} onRetry={recargar} /> : null}{!cargando && !error ? <EmptyState title="Curso no disponible" description="Vuelve al catálogo para explorar cursos." /> : null}</></Screen>;
  }

  return (
    <Screen title="Curso" backHref="/catalogo">
      <MediaPlaceholder label={curso.nombre} source={curso.imagen} detail />
      <View style={styles.heading}>
        <ThemedText type="title" accessibilityRole="header">{curso.nombre}</ThemedText>
        {curso.descripcion ? <ThemedText themeColor="textSecondary">{curso.descripcion}</ThemedText> : null}
      </View>
      <View style={styles.details}>
        {informacion.map((item) => <InfoRow key={item.label} {...item} />)}
      </View>
      <ThemedView surface="card"><InfoRow label="Precio" value={precio} accent /></ThemedView>
      <InscripcionForm curso={curso} />
    </Screen>
  );
}

const styles = StyleSheet.create({ heading: { gap: Spacing.two }, details: { gap: Spacing.four } });
