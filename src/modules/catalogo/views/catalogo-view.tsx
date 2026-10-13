import { useLocalSearchParams } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { Screen } from '@/components/ui/screen';
import { CatalogCard, ChoiceChips, SearchField, SectionHeading } from '@/components/ui/style-guide';
import { Spacing } from '@/theme';
import { useCatalogoViewModel } from '../viewmodels/use-catalogo-view-model';
import { EmptyState, ErrorState, LoadingState } from '@/components/feedback/async-states';
export default function CatalogScreen() {
 const { q } = useLocalSearchParams<{ q?: string }>();
 return <CatalogContent key={q ?? ''} busquedaInicial={q} />;
}
function CatalogContent({ busquedaInicial }: { busquedaInicial?: string }) {
 const vm = useCatalogoViewModel('Cursos', busquedaInicial);
 return <Screen title="Cursos">
  <SearchField placeholder="Buscar cursos…" value={vm.busqueda} onChangeText={vm.cambiarBusqueda} />
  <View style={styles.section}><SectionHeading title="Cursos disponibles" />
   <ChoiceChips options={vm.filtrosCurso.map(value => ({ value, label: value }))} selected={vm.filtroCurso} onSelect={vm.seleccionarFiltroCurso} />
   {vm.cargando ? <LoadingState label="Cargando cursos…" /> : null}
   {!vm.cargando && vm.error ? <ErrorState message={vm.error} onRetry={vm.recargar} /> : null}
   {!vm.cargando && !vm.error && vm.vacio ? <EmptyState title="No encontramos resultados" description={vm.busqueda ? 'Prueba otra búsqueda.' : 'No hay cursos disponibles.'} /> : null}
   {!vm.cargando && !vm.error ? vm.tarjetas.map(({ id, ...card }) => <CatalogCard key={id} {...card} />) : null}
  </View>
 </Screen>;
}
const styles = StyleSheet.create({ section: { gap: Spacing.three } });
