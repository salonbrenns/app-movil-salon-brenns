import { fetchHttpClient, type HttpMutationClient, type RequestOptions } from '@/services/api';
import { apiId } from '@/shared/adapters/account-validation';
import { misCursosResponse, inscripcionResponse, estadoInscripcionResponse } from '../adapters/inscripciones-adapter';
import { HttpError } from '@/services/api';
import type { MiCurso, InscripcionCreada } from '../models/inscripcion';

function pendiente(cursos: readonly MiCurso[], cursoId: string): InscripcionCreada | null {
  const enrollment = cursos.find((item) => item.cursoId === cursoId && item.estado === 'ACTIVO');
  const payment = enrollment?.pagos.find((item) => item.estado === 'PENDIENTE' && !item.comprobanteRecibido);
  return enrollment && payment ? { inscripcionId: enrollment.id, pagoId: payment.id, monto: payment.monto } : null;
}
export class HttpInscripcionesService {
  constructor(private readonly http: HttpMutationClient = fetchHttpClient) {}
  async listar(options?: RequestOptions) { return misCursosResponse(await this.http.get('/api/mis-cursos', options)); }
  async estado(id: string, options?: RequestOptions) { return estadoInscripcionResponse(await this.http.get('/api/cursos/' + apiId(id) + '/estado', options)); }
  async inscribir(id: string): Promise<InscripcionCreada> {
    const inscrito = await this.estado(id);
    const existing = await this.listar();
    const resume = pendiente(existing, id);
    if (resume) return resume;
    if (inscrito || existing.some((item) => item.cursoId === id && item.estado === 'ACTIVO')) throw new Error('Ya estás inscrito en este curso. Consulta su estado en Mis cursos.');
    try {
      return inscripcionResponse((await this.http.request('/api/cursos/' + apiId(id) + '/inscribir', { method: 'POST' })).body);
    } catch (error) {
      if (error instanceof TypeError || error instanceof HttpError && error.status === 409) {
        try {
          const recovered = pendiente(await this.listar(), id);
          if (recovered) return recovered;
        } catch { /* The original request error remains authoritative. */ }
      }
      throw error;
    }
  }
}
