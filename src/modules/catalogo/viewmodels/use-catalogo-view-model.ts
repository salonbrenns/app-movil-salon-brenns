import { useMemo, useState } from 'react';
import { ComposedCatalogoService, type CatalogoService } from '../services/catalogo-service';
import { CatalogoViewModel } from './catalogo-view-model';
import type { TarjetaCatalogo } from './catalogo-state';
import { formatPrice } from '@/utils/format-price';
import { useLoadState } from '@/shared/viewmodels/use-load-state';
const defaultService: CatalogoService = new ComposedCatalogoService();
function normalize(value: string) { return value.trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase(); }
export function filtrarCursos(cursos: import('../models/catalogo').DatosCatalogo['Cursos'], busqueda: string, nivel: string) {
 const query = normalize(busqueda);
 return cursos.filter(item => (!query || [item.nombre, item.descripcion, item.nivel].some(value => value && normalize(value).includes(query))) && (nivel === 'Todos' || item.nivel === nivel));
}
export function useCatalogoViewModel(_categoriaInicial?: string, busquedaInicial = '', service: CatalogoService = defaultService) {
 const viewModel = useMemo(() => new CatalogoViewModel(service), [service]);
 const { estado, tipoError } = useLoadState(viewModel);
 const [busqueda, cambiarBusqueda] = useState(busquedaInicial);
 const [filtroCurso, seleccionarFiltroCurso] = useState('Todos');
 const tarjetas: readonly TarjetaCatalogo[] = filtrarCursos(estado.datos.Cursos, busqueda, filtroCurso).map(item => ({
  id: item.id, title: item.nombre, description: item.descripcion ?? undefined, price: formatPrice(item.precio), kind: 'course', image: item.imagen,
  href: { pathname: '/cursos', params: { id: item.id } },
 }));
 return { estado, tipoError, busqueda, cambiarBusqueda, tarjetas, filtroCurso, seleccionarFiltroCurso,
  filtrosCurso: ['Todos', ...new Set(estado.datos.Cursos.map(item => item.nivel).filter((value): value is string => !!value))],
  cargando: estado.estadoCarga === 'cargando', error: estado.error, vacio: estado.estadoCarga === 'listo' && tarjetas.length === 0,
  recargar: () => viewModel.cargar() };
}
