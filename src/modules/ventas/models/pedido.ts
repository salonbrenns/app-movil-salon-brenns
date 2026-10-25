export type Pedido = Readonly<{
  id: string;
  estado: string;
  total: string;
  fecha: string;
  comprobanteRecibido: boolean;
  detalles: readonly { id: string; nombre: string; variante: string | null; cantidad: number; subtotal: string }[];
}>;
