import type { Curso } from '@/modules/cursos/models/curso';
export const CATEGORIAS_CATALOGO = ['Cursos'] as const;
export type CategoriaCatalogo = (typeof CATEGORIAS_CATALOGO)[number];
export type DatosCatalogo = Readonly<{ Cursos: readonly Curso[] }>;
