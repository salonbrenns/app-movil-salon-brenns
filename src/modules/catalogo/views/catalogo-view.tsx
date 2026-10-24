import { useLocalSearchParams, type Href } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Screen } from '@/components/ui/screen';
import { FilterSheet } from '@/components/ui/filter-sheet';
import { FilterSelector } from '@/components/ui/filter-selector';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Touchable } from '@/components/ui/touchable';
import { ThemedText } from '@/components/themed-text';
import {
  CatalogCard,
  SearchField,
  SectionHeading,
  SegmentedControl,
} from '@/components/ui/style-guide';
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from '@/components/feedback/async-states';
import { ProductosListView } from '@/modules/productos/views/productos-list-view';
import { Colors, Radius, Shadows, Sizes, Spacing } from '@/theme';
import { useCatalogoViewModel } from '@/modules/catalogo/viewmodels/use-catalogo-view-model';

export default function CatalogScreen() {
  const { categoria, q } = useLocalSearchParams<{
    categoria?: string;
    q?: string;
  }>();

  return (
    <CatalogContent
      key={`${categoria ?? 'Servicios'}-${q ?? ''}`}
      categoriaInicial={categoria}
      busquedaInicial={q}
    />
  );
}

export function CatalogContent({
  categoriaInicial,
  busquedaInicial,
  title = 'Catálogo',
  hideCategory = false,
  backHref,
}: {
  categoriaInicial?: string;
  busquedaInicial?: string;
  title?: string;
  hideCategory?: boolean;
  backHref?: Href;
}) {
  const [filtrosAbiertos, setFiltrosAbiertos] = useState(false);
  const {
    categorias,
    categoriaSeleccionada,
    seleccionarCategoria,
    busqueda,
    cambiarBusqueda,
    tarjetas,
    productosFiltrados,
    cargando,
    error,
    vacio,
    recargar,
    filtrosProducto,
    filtroProducto,
    seleccionarFiltroProducto,
    ordenesProducto,
    ordenProducto,
    seleccionarOrdenProducto,
    filtrosServicio,
    filtroServicio,
    seleccionarFiltroServicio,
    filtrosCurso,
    filtroCurso,
    seleccionarFiltroCurso,
  } = useCatalogoViewModel(categoriaInicial, busquedaInicial);
  const count = categoriaSeleccionada === 'Productos' ? productosFiltrados.length : tarjetas.length;

  return (
    <Screen title={title} backHref={backHref}>
      <View style={styles.searchRow}>
        <View style={styles.searchField}><SearchField placeholder="Buscar en esta categoría…" value={busqueda} onChangeText={cambiarBusqueda} /></View>
        <Touchable accessibilityRole="button" accessibilityLabel="Abrir filtros" onPress={() => { setFiltrosAbiertos(true); }} style={styles.filterButton}>
          <Icon name="filter" color={Colors.primary} />
        </Touchable>
      </View>

      {!hideCategory ? <SegmentedControl
        options={categorias}
        selected={categoriaSeleccionada}
        onSelect={seleccionarCategoria}
      /> : null}

      <View style={styles.section}>
        {!hideCategory ? <SectionHeading title={categoriaSeleccionada} /> : null}
        {!cargando && !error ? <View style={styles.metaRow}>
          <ThemedText type="small" themeColor="textSecondary" style={styles.grow}>{count} {count === 1 ? 'resultado' : 'resultados'}</ThemedText>
          {categoriaSeleccionada === 'Productos' ? <Touchable accessibilityRole="button" accessibilityLabel={`Ordenar productos: ${ordenProducto}`} onPress={() => { setFiltrosAbiertos(true); }} style={styles.orderButton}>
            <ThemedText type="smallBold" themeColor="textSecondary">{ordenProducto}</ThemedText><Icon name="filter" size={16} color={Colors.textSecondary} />
          </Touchable> : null}
        </View> : null}
        {!cargando && !error && (filtroServicio !== 'Todas' && categoriaSeleccionada === 'Servicios' || filtroCurso !== 'Todos' && categoriaSeleccionada === 'Cursos' || filtroProducto !== 'Todos' && categoriaSeleccionada === 'Productos' || ordenProducto !== 'Publicación' && categoriaSeleccionada === 'Productos') ? <ThemedText type="small" themeColor="primary">
          Filtros aplicados: {categoriaSeleccionada === 'Servicios' ? filtroServicio : categoriaSeleccionada === 'Cursos' ? filtroCurso : [filtroProducto !== 'Todos' ? filtroProducto : null, ordenProducto !== 'Publicación' ? ordenProducto : null].filter(Boolean).join(' · ')}
        </ThemedText> : null}

        {cargando ? (
          <LoadingState label="Cargando catálogo…" />
        ) : null}

        {!cargando && error ? (
          <ErrorState message={error} onRetry={recargar} />
        ) : null}

        {!cargando && !error && vacio ? (
          <EmptyState
            title="No encontramos resultados"
            description={
              busqueda
                ? 'Prueba otra búsqueda.'
                : 'No hay elementos disponibles en esta categoría.'
            }
          />
        ) : null}

        {!cargando && !error ? (
          categoriaSeleccionada === 'Productos' ? (
            <ProductosListView
              productos={productosFiltrados}
              resetKey={JSON.stringify([
                busqueda,
                filtroProducto,
                ordenProducto,
              ])}
            />
          ) : (
            tarjetas.map(({ id, ...card }) => (
              <CatalogCard key={id} {...card} />
            ))
          )
        ) : null}
      </View>
      <FilterSheet visible={filtrosAbiertos} onClose={() => { setFiltrosAbiertos(false); }}>
        <View style={styles.filterSection}>
          {categoriaSeleccionada === 'Servicios' ? <FilterSelector label="Categoría" options={filtrosServicio} selected={filtroServicio} onSelect={seleccionarFiltroServicio} /> : null}
          {categoriaSeleccionada === 'Cursos' ? <FilterSelector label="Nivel" options={filtrosCurso} selected={filtroCurso} onSelect={seleccionarFiltroCurso} /> : null}
          {categoriaSeleccionada === 'Productos' ? <FilterSelector label="Categoría y disponibilidad" options={filtrosProducto} selected={filtroProducto} onSelect={seleccionarFiltroProducto} /> : null}
        </View>
        {categoriaSeleccionada === 'Productos' ? <View style={styles.filterSection}>
          <FilterSelector label="Ordenar por" options={ordenesProducto} selected={ordenProducto} onSelect={seleccionarOrdenProducto} />
        </View> : null}
        <Button label="Limpiar filtros" variant="secondary" onPress={() => { seleccionarFiltroServicio('Todas'); seleccionarFiltroCurso('Todos'); seleccionarFiltroProducto('Todos'); seleccionarOrdenProducto('Publicación'); }} />
      </FilterSheet>
    </Screen>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: Spacing.three,
  },
  searchRow: { flexDirection: 'row', gap: Spacing.two, alignItems: 'center' },
  searchField: { flex: 1, minWidth: 0 },
  filterButton: { width: Sizes.controlMinHeight, height: Sizes.controlMinHeight, borderRadius: Radius.control, borderWidth: Sizes.borderWidth, borderColor: Colors.borderAccent, backgroundColor: Colors.backgroundElement, alignItems: 'center', justifyContent: 'center', ...Shadows.control },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  grow: { flex: 1 },
  orderButton: { flexDirection: 'row', alignItems: 'center', gap: Spacing.one, minHeight: Sizes.touchMinWidth, paddingHorizontal: Spacing.two, borderRadius: Radius.control, borderWidth: Sizes.borderWidth, borderColor: Colors.borderAccent, backgroundColor: Colors.backgroundElement, ...Shadows.control },
  filterSection: { gap: Spacing.two },
});
