export type ItemCarrito = Readonly<{ id: string; varianteId: string; titulo: string; variante: string; precio: string; cantidad: number; stock: number; imagen: string | null }>;
export type ResumenCarrito = Readonly<{ subtotal: string }>;
export type DatosCarrito = Readonly<{ items: readonly ItemCarrito[]; resumen: ResumenCarrito }>;
