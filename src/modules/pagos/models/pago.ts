export type PaymentKind = 'cita' | 'curso' | 'pedido';

export type PaymentOperation = Readonly<{
  kind: PaymentKind;
  id: string;
  title: string;
  detail: string | null;
  amount: string | null;
  status: string;
  proofReceived: boolean;
  canUpload: boolean;
}>;

export function paymentKind(value: string | undefined): PaymentKind | null {
  if (value === 'cita' || value === 'curso' || value === 'pedido') return value;
  return null;
}
