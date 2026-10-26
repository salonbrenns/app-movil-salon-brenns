import { useCallback } from 'react';
import { router } from 'expo-router';
import type { CategoriaCatalogo } from '@/modules/catalogo/models/catalogo';
import { HttpFavoritosService } from '../services/favoritos-service';
import { useSessionResource } from '@/shared/viewmodels/use-session-resource';
const service = new HttpFavoritosService();
export function useFavoriteCollection(categoria: CategoriaCatalogo) {
  const vm = useSessionResource(useCallback((signal?: AbortSignal) => service.listar(categoria, { signal }), [categoria]));
  return { ...vm,
    isFavorite: (id?: string) => !!id && !!vm.datos?.some((item) => item.id === id),
    toggle: (id: string) => {
      if (!vm.authenticated) {
        router.push({ pathname: '/autenticacion', params: { returnTo: categoria === 'Productos' ? '/productos/' + id : (categoria === 'Cursos' ? '/cursos?id=' : '/servicios?id=') + id } });
        return;
      }
      void vm.ejecutar(() => service.toggle(categoria, id), (accion) => accion === 'agregado' ? 'Favorito agregado.' : 'Favorito eliminado.');
    },
  };
}

export function useFavoriteAction(categoria: CategoriaCatalogo, id?: string) {
  const vm = useFavoriteCollection(categoria);
  return { ...vm, selected: vm.isFavorite(id), toggle: () => { if (id) vm.toggle(id); } };
}
