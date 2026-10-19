import { fetchHttpClient, type HttpClient, type RequestOptions } from '@/services/api';
import { perfilResponse } from '../adapters/perfil-adapter';
import type { Perfil } from '../models/perfil';

export class HttpPerfilService {
  constructor(private readonly http: HttpClient = fetchHttpClient) {}

  async obtener(expectedEmail: string, options?: RequestOptions): Promise<Perfil> {
    return perfilResponse(await this.http.get('/api/usuario/perfil', options), expectedEmail);
  }
}
