import { HttpCursosService, type CursosService } from '@/modules/cursos/services/cursos-service';
import type { RequestOptions } from '@/services/api';
import type { DatosCatalogo } from '../models/catalogo';
export interface CatalogoService { obtener(options?: RequestOptions): Promise<DatosCatalogo> }
export class ComposedCatalogoService implements CatalogoService {
  constructor(private readonly cursos: CursosService = new HttpCursosService()) {}
  async obtener(options?: RequestOptions): Promise<DatosCatalogo> { return { Cursos: await this.cursos.listar(options) }; }
}
