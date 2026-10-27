import type { DocumentPickerAsset } from 'expo-document-picker';
import { useCallback, useRef, useState } from 'react';
import { useSessionResource } from '@/shared/viewmodels/use-session-resource';
import { useTransferenciaViewModel } from '@/shared/viewmodels/use-transferencia-view-model';
import { HttpComprobanteService } from '@/shared/services/comprobante-service';
import { operationError } from '@/shared/viewmodels/session-resource';
import { HttpError } from '@/services/api';
import type { PaymentKind } from '../models/pago';
import { PaymentOperationService } from '../services/payment-operation-service';

const operations = new PaymentOperationService();
const proofs = new HttpComprobanteService();

export function usePaymentViewModel(kind: PaymentKind | null, id: string) {
  const payment = useSessionResource(useCallback((signal?: AbortSignal) => {
    if (!kind || !id) return Promise.reject(new Error('El enlace de pago no es válido.'));
    return operations.obtener(kind, id, { signal });
  }, [kind, id]));
  const bank = useTransferenciaViewModel();
  const [uploaded, setUploaded] = useState<string | null>(null);
  const inFlight = useRef(false);
  const uploadKey = kind && id ? `${kind}:${id}` : null;
  const proofReceived = !!payment.datos?.proofReceived || (!!uploadKey && uploaded === uploadKey);
  const canUpload = !!payment.datos?.canUpload && !!payment.datos.amount && !proofReceived;

  async function upload(asset: DocumentPickerAsset) {
    if (!kind || !id || !payment.datos || !canUpload || !uploadKey || inFlight.current) throw new Error('Este pago no admite otro comprobante. Actualiza su estado.');
    inFlight.current = true;
    try {
      await proofs.subir(kind === 'cita' ? 'citas' : kind === 'curso' ? 'pagos-curso' : 'pedidos', id, asset);
      setUploaded(uploadKey);
      await payment.recargar();
    } catch (error) {
      if (error instanceof TypeError || error instanceof HttpError && error.status === 409) {
        try {
          const current = await operations.obtener(kind, id);
          if (current.proofReceived) { setUploaded(uploadKey); await payment.recargar(); return; }
        } catch { /* Report the original upload failure. */ }
      }
      throw new Error(operationError(error).message);
    } finally {
      inFlight.current = false;
    }
  }

  return { payment, bank, proofReceived, canUpload, upload };
}
