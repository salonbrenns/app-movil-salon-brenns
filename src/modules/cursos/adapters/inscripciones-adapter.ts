import { record, list, identifier, text, decimal, nullableText } from '@/shared/adapters/validation';
import { instant, integer } from '@/shared/adapters/account-validation';
import { AdapterError } from '@/shared/adapters/adapter-error';
import type { MiCurso } from '../models/inscripcion';
export function estadoInscripcionResponse(value: unknown): boolean {
  const dto = record(value, 'curso.estado');
  if (typeof dto.inscrito !== 'boolean') throw new AdapterError('curso.estado.inscrito', 'booleano');
  return dto.inscrito;
}
export function misCursosResponse(value: unknown): readonly MiCurso[] {
  return list(record(value, 'mis-cursos').cursos, 'mis-cursos.cursos').map((item) => {
    const dto = record(item, 'inscripción'); const curso = dto.curso === null ? null : record(dto.curso, 'inscripción.curso');
    return { id: identifier(dto.inscripcionId, 'inscripcionId'), cursoId: curso ? identifier(curso.id, 'curso.id') : null,
      nombre: curso ? text(curso.titulo, 'curso.titulo') : null, precio: curso ? decimal(curso.precio_total, 'curso.precio_total') : null,
      estado: text(dto.estado, 'inscripción.estado'), fecha: instant(dto.fecha_inscripcion, 'fecha_inscripcion'),
      totalPagado: decimal(dto.totalPagado, 'totalPagado'), diasAsistidos: integer(dto.diasAsistidos, 'diasAsistidos'),
      pagos: list(dto.pagos, 'pagos').map((value) => { const pago = record(value, 'pago'); return { id: identifier(pago.id, 'pago.id'), monto: decimal(pago.monto, 'pago.monto'), estado: text(pago.estado, 'pago.estado'), comprobanteRecibido: pago.comprobante_url == null ? false : !!nullableText(pago.comprobante_url, 'pago.comprobante_url') }; }) };
  });
}
export function inscripcionResponse(value: unknown) {
  const dto = record(value, 'inscripción');
  if (dto.success !== true || dto.tipoPago !== 'COMPLETO' || dto.metodoPago !== 'TRANSFERENCIA') throw new Error('El servidor no confirmó la inscripción.');
  return { inscripcionId: identifier(dto.inscripcionId, 'inscripcionId'), pagoId: identifier(dto.pagoId, 'pagoId'), monto: decimal(dto.monto, 'monto') };
}
