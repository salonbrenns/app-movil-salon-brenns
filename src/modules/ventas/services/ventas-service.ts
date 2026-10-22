import { fetchHttpClient, type HttpMutationClient } from '@/services/api';
import { InputError } from '@/shared/adapters/input-error';
import type { Perfil } from '@/modules/perfil/models/perfil';
import { pedidoCreadoResponse } from '../adapters/ventas-adapter';
import { pedidosResponse } from '../adapters/pedidos-adapter';

export class HttpVentasService {
  private pending = false;

  constructor(private readonly http: HttpMutationClient = fetchHttpClient) {}

  async listar(options?: import('@/services/api').RequestOptions) {
    return pedidosResponse(await this.http.get('/api/pedidos', options));
  }

  async crear(metodoPago: string, perfil: Perfil) {
    if (this.pending) throw new InputError('La confirmación del pedido ya está en curso.');
    if (metodoPago !== 'transferencia') throw new InputError('Solo se admite transferencia bancaria en la aplicación.');
    if (!perfil.nombre.trim() || !perfil.correo.trim()) throw new InputError('El perfil debe tener nombre y correo para crear el pedido.');

    this.pending = true;
    try {
      const result = await this.http.request('/api/pedidos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          metodo_pago: metodoPago,
          nombre_cliente: perfil.nombre,
          correo_cliente: perfil.correo,
          telefono_cliente: perfil.telefono,
        }),
      });
      return pedidoCreadoResponse(result.body, 'transferencia');
    } finally {
      this.pending = false;
    }
  }
}
