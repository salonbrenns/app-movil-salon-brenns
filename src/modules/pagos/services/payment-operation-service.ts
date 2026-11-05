import { HttpAgendaService } from '@/modules/agenda/services/agenda-service';
import { HttpInscripcionesService } from '@/modules/cursos/services/inscripciones-service';
import { HttpVentasService } from '@/modules/ventas/services/ventas-service';
import { apiId } from '@/shared/adapters/account-validation';
import type { RequestOptions } from '@/services/api';
import type { PaymentKind, PaymentOperation } from '../models/pago';
import { formatCalendarDate } from '@/utils/format-calendar-date';

export class PaymentOperationService {
  constructor(
    private readonly agenda = new HttpAgendaService(),
    private readonly cursos = new HttpInscripcionesService(),
    private readonly ventas = new HttpVentasService(),
  ) {}

  async obtener(kind: PaymentKind, id: string, options?: RequestOptions): Promise<PaymentOperation> {
    const paymentId = String(apiId(id));
    if (kind === 'cita') {
      const cita = (await this.agenda.listar(options)).find((item) => item.id === paymentId);
      if (!cita) throw new Error('La cita no está disponible en tu cuenta. Consulta Mis citas.');
      return { kind, id: paymentId, title: cita.servicioNombre, detail: `${formatCalendarDate(cita.fecha.slice(0, 10))} · ${cita.hora}`, amount: cita.total, status: cita.estado,
        proofReceived: cita.comprobanteRecibido, canUpload: cita.estado === 'PENDIENTE' && !cita.comprobanteRecibido };
    }
    if (kind === 'curso') {
      const enrollment = (await this.cursos.listar(options)).find((item) => item.pagos.some((payment) => payment.id === paymentId));
      const pago = enrollment?.pagos.find((payment) => payment.id === paymentId);
      if (!enrollment || !pago) throw new Error('El pago no está disponible en Mis cursos.');
      return { kind, id: paymentId, title: enrollment.nombre ?? `Inscripción #${enrollment.id}`, detail: `Inscripción #${enrollment.id}`, amount: pago.monto, status: pago.estado,
        proofReceived: pago.comprobanteRecibido, canUpload: enrollment.estado === 'ACTIVO' && pago.estado === 'PENDIENTE' && !pago.comprobanteRecibido };
    }
    const pedido = (await this.ventas.listar(options)).find((item) => item.id === paymentId);
    if (!pedido) throw new Error('El pedido no está disponible en Mis compras.');
    return { kind, id: paymentId, title: `Pedido #${pedido.id}`, detail: pedido.detalles.map((item) => `${item.nombre} × ${item.cantidad}`).join(' · '), amount: pedido.total, status: pedido.estado,
      proofReceived: pedido.comprobanteRecibido, canUpload: pedido.estado === 'PENDIENTE' && !pedido.comprobanteRecibido };
  }
}
