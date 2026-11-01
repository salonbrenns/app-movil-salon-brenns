import { render, screen, userEvent } from '@testing-library/react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { InscripcionForm } from '@/modules/cursos/views/inscripcion-form';
import { ReservaForm } from '@/modules/agenda/views/reserva-form';
import CarritoView from '@/modules/carrito/views/carrito-view';
import FinalizarCompraView from '@/modules/carrito/views/finalizar-compra-view';
import PaymentView from '@/modules/pagos/views/payment-view';
import { useInscripcionViewModel } from '@/modules/cursos/viewmodels/use-inscripcion-view-model';
import { useReservaViewModel } from '@/modules/agenda/viewmodels/use-reserva-view-model';
import { useCarritoViewModel } from '@/modules/carrito/viewmodels/use-carrito-view-model';
import { usePaymentViewModel } from '@/modules/pagos/viewmodels/use-payment-view-model';

jest.mock('expo-router', () => {
  const React = jest.requireActual<typeof import('react')>('react');
  const routerMock = { push: jest.fn() };
  return { router: routerMock, useLocalSearchParams: jest.fn(), Link: ({ href, children }: { href: unknown; children: React.ReactElement<{ onPress?: () => void }> }) => React.cloneElement(children, { onPress: () => routerMock.push(href) }) };
});
jest.mock('@/modules/auth/viewmodels/auth-session-provider', () => ({ useAuthSession: () => ({ status: 'authenticated' }) }));
jest.mock('@/modules/cursos/viewmodels/use-inscripcion-view-model', () => ({ useInscripcionViewModel: jest.fn() }));
jest.mock('@/modules/agenda/viewmodels/use-reserva-view-model', () => ({ useReservaViewModel: jest.fn() }));
jest.mock('@/modules/carrito/viewmodels/use-carrito-view-model', () => ({ useCarritoViewModel: jest.fn() }));
jest.mock('@/modules/pagos/viewmodels/use-payment-view-model', () => ({ usePaymentViewModel: jest.fn() }));
jest.mock('@/components/themed-text', () => ({ ThemedText: jest.requireActual<typeof import('react-native')>('react-native').Text }));
jest.mock('@/components/themed-view', () => ({ ThemedView: jest.requireActual<typeof import('react-native')>('react-native').View }));
jest.mock('@/components/ui/button', () => {
  const React = jest.requireActual<typeof import('react')>('react');
  const { Pressable, Text } = jest.requireActual<typeof import('react-native')>('react-native');
  const Button = ({ label, onPress, disabled }: { label: string; onPress?: () => void; disabled?: boolean }) => React.createElement(Pressable, { accessibilityRole: 'button', accessibilityLabel: label, accessibilityState: { disabled: !!disabled }, disabled, onPress }, React.createElement(Text, null, label));
  return { Button, CustomButton: Button };
});
jest.mock('@/components/ui/screen', () => ({ Screen: ({ children }: { children: React.ReactNode }) => jest.requireActual<typeof import('react')>('react').createElement(jest.requireActual<typeof import('react-native')>('react-native').View, null, children) }));
jest.mock('@/components/ui/style-guide', () => {
  const React = jest.requireActual<typeof import('react')>('react');
  const { Text } = jest.requireActual<typeof import('react-native')>('react-native');
  return { InfoRow: ({ label, value }: { label: string; value: string }) => React.createElement(Text, null, `${label}: ${value}`), ChoiceChips: () => null,
    MediaPlaceholder: ({ source }: { source?: string | null }) => source ? null : React.createElement(Text, null, 'Imagen') };
});
jest.mock('@/components/feedback/resource-status', () => ({ ResourceStatus: ({ error }: { error?: string | null }) => error
  ? jest.requireActual<typeof import('react')>('react').createElement(jest.requireActual<typeof import('react-native')>('react-native').Text, null, error) : null }));
jest.mock('@/components/feedback/status-message', () => ({ StatusMessage: ({ message }: { message: string }) => jest.requireActual<typeof import('react')>('react').createElement(jest.requireActual<typeof import('react-native')>('react-native').Text, null, message) }));
jest.mock('@/components/feedback/async-states', () => ({ LoadingState: () => null, ErrorState: () => null }));
jest.mock('@/components/ui/datos-transferencia', () => ({ DatosTransferencia: ({ datos }: { datos: { banco: string } }) => jest.requireActual<typeof import('react')>('react').createElement(jest.requireActual<typeof import('react-native')>('react-native').Text, null, `Banco: ${datos.banco}`) }));
jest.mock('@/components/ui/payment-proof-uploader', () => ({ PaymentProofUploader: () => jest.requireActual<typeof import('react')>('react').createElement(jest.requireActual<typeof import('react-native')>('react-native').Text, null, 'Selector de comprobante disponible') }));
jest.mock('@/components/ui/icon', () => ({ Icon: () => null }));
jest.mock('@/components/ui/text-link', () => ({ TextLink: () => null }));
jest.mock('@/components/ui/calendar', () => ({ Calendar: () => null }));
jest.mock('@/components/ui/horarios-selector', () => ({ HorariosSelector: () => null }));
jest.mock('@/modules/legal/components/store-pickup-info', () => ({ StorePickupInfo: () => jest.requireActual<typeof import('react')>('react').createElement(jest.requireActual<typeof import('react-native')>('react-native').Text, null, 'Recogida en tienda') }));
jest.mock('@/components/ui/account-section-styles', () => ({ accountSectionStyles: { form: {}, section: {} } }));

const navigate = router.push as jest.Mock;
beforeEach(() => { navigate.mockReset(); });

const transfer = { cargando: false, error: null, datos: { anticipoPorcentaje: 50, banco: { banco: 'Banco', titular: 'Titular', cuenta: '1234567890', clabe: '123456789012345678' } }, recargar: jest.fn() };

test('Inscribirme confirma el curso y navega con el pagoId real', () => {
  const inscribir = jest.fn(async (onCreated: (id: string) => void) => { onCreated('31'); return true; });
  (useInscripcionViewModel as jest.Mock).mockReturnValue({ authenticated: true, cargando: false, error: null, mensaje: null, ocupado: false, recargar: jest.fn(), transferencia: transfer, inscripcion: null, inscrito: false, pagoId: null, proofReceived: false, permitido: true, sinCupo: false, puedeInscribir: true, inscribir });
  const user = userEvent.setup();
  return render(<InscripcionForm curso={{ id: '7', nombre: 'Colorimetría', precio: '1200.00' }} />).then(async () => {
    await user.press(screen.getByRole('button', { name: 'Inscribirme' }));
    expect(screen.getByText(/Confirma la inscripción/)).toBeTruthy();
    await user.press(screen.getByRole('button', { name: 'Confirmar inscripción' }));
    expect(inscribir).toHaveBeenCalledTimes(1);
    expect(navigate).toHaveBeenCalledWith({ pathname: '/pago', params: { tipo: 'curso', id: '31' } });
  });
});

test('un curso terminado informa el motivo y no registra otra inscripción', () => {
  const inscribir = jest.fn();
  (useInscripcionViewModel as jest.Mock).mockReturnValue({ authenticated: true, cargando: false, error: null, mensaje: null, ocupado: false, recargar: jest.fn(), transferencia: transfer, inscripcion: null, inscrito: false, pagoId: null, proofReceived: false, permitido: true, sinCupo: false, finalizado: true, puedeInscribir: false, inscribir });
  return render(<InscripcionForm curso={{ id: '11', nombre: 'Ortonixias', precio: '2500.00', fechaFin: '2026-08-02' }} />).then(() => {
    expect(screen.getByText(/Este curso ya terminó/)).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Inscribirme' }).props.accessibilityState.disabled).toBe(true);
    expect(inscribir).not.toHaveBeenCalled();
  });
});

test('seleccionar fecha y hora abre el pago sin crear todavía la cita', () => {
  const reservar = jest.fn();
  (useReservaViewModel as jest.Mock).mockReturnValue({ authenticated: true, cargando: false, error: null, mensaje: null, ocupado: false, recargar: jest.fn(), dias: { datos: [], cargando: false, error: null, recargar: jest.fn() }, calendar: {}, fecha: '2026-11-10', hora: '10:00', tipoPago: 'COMPLETO', importe: '150.00', cita: null, comprobanteEnviado: false, horarios: [], conflicto: null, consultado: false, sinAtencion: false, transferencia: transfer, puedeContinuar: true, cambiarFecha: jest.fn(), cambiarHora: jest.fn(), cambiarTipoPago: jest.fn(), reservar });
  const user = userEvent.setup();
  return render(<ReservaForm servicio={{ id: '3', nombre: 'Corte', precio: '150.00' }} />).then(async () => {
    await user.press(screen.getByRole('button', { name: 'Continuar con la reserva' }));
    expect(reservar).not.toHaveBeenCalled();
    expect(navigate).toHaveBeenCalledWith({ pathname: '/pago-servicio', params: { id: '3', fecha: '2026-11-10', hora: '10:00' } });
  });
});

test('Carrito vacío ofrece Mis compras como botón y no muestra Continuar compra', () => {
  (useCarritoViewModel as jest.Mock).mockReturnValue({ authenticated: true, cargando: false, error: null, mensaje: null, ocupado: false, recargar: jest.fn(), items: [], resumen: { subtotal: '0.00' }, transferencia: transfer, pedidoRegistrado: null, existenciasValidas: true });
  const user = userEvent.setup();
  return render(<CarritoView />).then(async () => {
    await user.press(screen.getByRole('button', { name: 'Mis compras' }));
    expect(navigate).toHaveBeenCalledWith('/cuenta/compras');
    expect(screen.queryByRole('button', { name: 'Continuar compra' })).toBeNull();
  });
});

test('Carrito muestra cantidades y un solo botón principal hacia finalizar compra', () => {
  const confirmarPedido = jest.fn();
  const cambiarCantidad = jest.fn();
  const eliminar = jest.fn();
  const vaciar = jest.fn();
  (useCarritoViewModel as jest.Mock).mockReturnValue({ authenticated: true, cargando: false, error: null, mensaje: null, ocupado: false, recargar: jest.fn(), items: [{ id: '1', titulo: 'Producto', precio: '100.00', variante: null, cantidad: 1, stock: 5 }], resumen: { subtotal: '100.00' }, perfil: { nombre: 'Ana', correo: 'ana@example.com' }, errorPerfil: null, recargarPerfil: jest.fn(), transferencia: transfer, pedidoRegistrado: null, comprobanteEnviado: false, existenciasValidas: true, eliminar, cambiarCantidad, vaciar, confirmarPedido });
  const user = userEvent.setup();
  return render(<CarritoView />).then(async () => {
    expect(screen.getByText('Producto')).toBeTruthy();
    expect(screen.getByText('Imagen')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Reducir cantidad de Producto' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Aumentar cantidad de Producto' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Eliminar Producto' })).toBeTruthy();
    expect(screen.getAllByText('Subtotal')).toHaveLength(1);
    expect(screen.queryByRole('button', { name: 'Pagar' })).toBeNull();
    await user.press(screen.getByRole('button', { name: 'Aumentar cantidad de Producto' }));
    expect(cambiarCantidad).toHaveBeenCalledWith('1', 2);
    await user.press(screen.getByRole('button', { name: 'Reducir cantidad de Producto' }));
    expect(cambiarCantidad).toHaveBeenCalledWith('1', 0);
    await user.press(screen.getByRole('button', { name: 'Eliminar Producto' }));
    expect(eliminar).toHaveBeenCalledWith('1');
    await user.press(screen.getByRole('button', { name: 'Vaciar carrito' }));
    expect(vaciar).toHaveBeenCalledTimes(1);
    await user.press(screen.getByRole('button', { name: 'Continuar compra' }));
    expect(navigate).toHaveBeenCalledWith('/finalizar-compra');
    expect(confirmarPedido).not.toHaveBeenCalled();
  });
});

test('Finalizar compra muestra resumen, comprador, transferencia y confirma antes de pedir comprobante', () => {
  let current = { authenticated: true, cargando: false, error: null, mensaje: null, ocupado: false, recargar: jest.fn(),
    items: [{ id: '1', titulo: 'Producto', precio: '100.00', variante: 'Rosa', cantidad: 2, stock: 5 }],
    resumen: { subtotal: '200.00' }, perfil: { nombre: 'Ana', correo: 'ana@example.com' }, errorPerfil: null,
    recargarPerfil: jest.fn(), transferencia: transfer, pedidoRegistrado: null as null | { id: string; total: string },
    comprobanteEnviado: false, existenciasValidas: true, eliminar: jest.fn(), cambiarCantidad: jest.fn(), vaciar: jest.fn(),
    enviarComprobante: jest.fn(), confirmarPedido: jest.fn() };
  current.confirmarPedido.mockImplementation(async (onCreated: (id: string) => void) => {
    current = { ...current, items: [], resumen: { subtotal: '200.00' }, pedidoRegistrado: { id: '51', total: '200.00' } };
    onCreated('51');
    return true;
  });
  (useCarritoViewModel as jest.Mock).mockImplementation(() => current);
  const user = userEvent.setup();
  return render(<FinalizarCompraView />).then(async () => {
    expect(screen.getByText('Producto')).toBeTruthy();
    expect(screen.getByText('Rosa')).toBeTruthy();
    expect(screen.getByText('2 × $100')).toBeTruthy();
    expect(screen.getByText('Subtotal: $200')).toBeTruthy();
    expect(screen.getByText('Total: $200')).toBeTruthy();
    expect(screen.getByText('Nombre: Ana')).toBeTruthy();
    expect(screen.getByText('Correo: ana@example.com')).toBeTruthy();
    expect(screen.getByText('Recogida en tienda')).toBeTruthy();
    expect(screen.getByText('Banco: Banco')).toBeTruthy();
    expect(screen.queryByText('Selector de comprobante disponible')).toBeNull();
    await user.press(screen.getByRole('button', { name: 'Confirmar pedido' }));
    expect(current.confirmarPedido).toHaveBeenCalledTimes(1);
    expect(screen.getByText('Pedido #51 registrado')).toBeTruthy();
    expect(screen.getByText('Selector de comprobante disponible')).toBeTruthy();
    expect(navigate).not.toHaveBeenCalled();
  });
});

test.each([
  ['cita', 'Volver a Mis citas', '/agenda'],
  ['curso', 'Volver a Mis cursos', '/cuenta/cursos'],
  ['pedido', 'Volver a Mis compras', '/cuenta/compras'],
])('la pantalla de pago de %s vuelve al registro correcto', (kind, label, destination) => {
  (useLocalSearchParams as jest.Mock).mockReturnValue({ tipo: kind, id: '31' });
  (usePaymentViewModel as jest.Mock).mockReturnValue({
    payment: { datos: { title: 'Operación', amount: '1200.00', status: 'PENDIENTE', proofReceived: true, canUpload: false }, cargando: false, error: null },
    bank: { datos: transfer.datos, cargando: false, error: null },
    proofReceived: true,
    canUpload: false,
  });
  const user = userEvent.setup();
  return render(<PaymentView />).then(async () => {
    await user.press(screen.getByRole('button', { name: label }));
    expect(navigate).toHaveBeenCalledWith(destination);
  });
});

test('un pedido ya creado permite adjuntar comprobante sin inventar datos bancarios', () => {
  (useLocalSearchParams as jest.Mock).mockReturnValue({ tipo: 'pedido', id: '2913' });
  (usePaymentViewModel as jest.Mock).mockReturnValue({
    payment: { datos: { title: 'Pedido #2913', amount: '260.00', status: 'PENDIENTE', proofReceived: false, canUpload: true }, cargando: false, error: null },
    bank: { datos: null, cargando: false, error: 'Los datos bancarios aún no están configurados correctamente. Intenta más tarde.' },
    proofReceived: false,
    canUpload: true,
  });
  return render(<PaymentView />).then(() => {
    expect(screen.getAllByText(/datos bancarios aún no están configurados/)).toHaveLength(1);
    expect(screen.getByText('Selector de comprobante disponible')).toBeTruthy();
    expect(screen.getByText(/Si ya realizaste la transferencia/)).toBeTruthy();
  });
});
