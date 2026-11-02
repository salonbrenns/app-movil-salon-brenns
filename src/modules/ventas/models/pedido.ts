export type Pedido = Readonly<{
  id: string;
  estado: string;
  total: string;
  importeProductos: string;
  costoEnvio: string | null;
  requiereRevision: boolean;
  fecha: string;
  comprobanteRecibido: boolean;
  detalles: readonly { id: string; nombre: string; variante: string | null; cantidad: number; precioUnitario: string | null; subtotal: string; imagen: string | null }[];
}>;
