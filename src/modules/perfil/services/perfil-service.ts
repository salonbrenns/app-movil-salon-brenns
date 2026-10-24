
import {
  fetchHttpClient,
  type HttpMutationClient,
  type RequestOptions,
} from '@/services/api';

import { confirmarOk } from '@/modules/auth/adapters/auth-adapter';
import { perfilResponse } from '../adapters/perfil-adapter';
import type { Perfil } from '../models/perfil';

export class HttpPerfilService {
  constructor(
    private readonly http: HttpMutationClient = fetchHttpClient
  ) {}

  // Obtener información del usuario
  async obtener(
    expectedEmail: string,
    options?: RequestOptions
  ): Promise<Perfil> {
    return perfilResponse(
      await this.http.get('/api/usuario/perfil', options),
      expectedEmail
    );
  }

  // Actualizar nombre y teléfono
  async actualizar(
    nombre: string,
    telefono: string
  ): Promise<void> {
    const result = await this.http.request(
      '/api/usuario/perfil',
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nombre: nombre.trim(),
          telefono: telefono.trim() || null,
        }),
      }
    );

    confirmarOk(result.body);
  }

  // Cambiar contraseña
  async cambiarPassword(
    passwordActual: string,
    passwordNueva: string
  ): Promise<void> {
    const result = await this.http.request(
      '/api/usuario/password',
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          passwordActual,
          passwordNueva,
        }),
      }
    );

    confirmarOk(result.body);
  }
}
