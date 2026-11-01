import { fireEvent, render, screen, userEvent } from '@testing-library/react-native';
import { router } from 'expo-router';
import InicioView from '@/modules/inicio/views/inicio-view';
import { useInicioViewModel } from '@/modules/inicio/viewmodels/use-inicio-view-model';

jest.mock('expo-router', () => {
  const React = jest.requireActual<typeof import('react')>('react');
  const routerMock = { push: jest.fn() };
  return { router: routerMock, Link: ({ href, children, asChild }: { href: unknown; children: React.ReactElement<{ onPress?: () => void; style?: unknown }>; asChild?: boolean }) => {
    if (asChild && Array.isArray(children.props.style)) throw new Error('Link asChild recibió un arreglo de estilos.');
    return React.cloneElement(children, { onPress: () => routerMock.push(href) });
  } };
});
jest.mock('expo-image', () => ({ Image: () => null }));
jest.mock('@/components/ui/icon', () => ({ Icon: () => null }));
jest.mock('@/components/ui/screen', () => ({ Screen: ({ children }: { children: React.ReactNode }) => jest.requireActual<typeof import('react')>('react').createElement(jest.requireActual<typeof import('react-native')>('react-native').View, null, children) }));
jest.mock('@/modules/inicio/viewmodels/use-inicio-view-model', () => ({ useInicioViewModel: jest.fn() }));

const push = router.push as jest.Mock;
jest.setTimeout(30_000);
const cita = { id: '41', servicioId: '3', servicioNombre: 'Pedicura clínica', total: '450.00', fecha: '2026-10-30T00:00:00.000Z', hora: '10:00', duracion: '1h', estado: 'CONFIRMADA', empleado: null, notas: null, comprobanteRecibido: false };

function homeVm(overrides: Record<string, unknown> = {}) {
  return {
    saludo: 'Hola, Benilde', status: 'authenticated', proximaCita: cita,
    agenda: { cargando: false, error: null, recargar: jest.fn(), datos: [cita] },
    ...overrides,
  };
}

beforeEach(() => {
  push.mockReset();
  (useInicioViewModel as jest.Mock).mockReturnValue(homeVm());
});

test('las tarjetas de categorías entregan estilos planos a Link asChild', () => render(<InicioView />).then(() => {
  for (const label of ['Productos', 'Servicios', 'Cursos']) {
    expect(screen.getByRole('button', { name: label })).toBeTruthy();
  }
}));

test.each([
  ['Productos', '/catalogo?categoria=Productos'],
  ['Servicios', '/catalogo?categoria=Servicios'],
  ['Cursos', '/catalogo?categoria=Cursos'],
  ['Favoritos', '/cuenta/favoritos'],
  ['Perfil', '/perfil'],
])('%s abre su destino desde Inicio', (label, destination) => {
  const user = userEvent.setup();
  return render(<InicioView />).then(async () => {
    await user.press(screen.getByRole('button', { name: label }));
    expect(push).toHaveBeenCalledWith(destination);
  });
});

test('la búsqueda envía el término ingresado al catálogo', () => {
  const user = userEvent.setup();
  return render(<InicioView />).then(async () => {
    const input = screen.getByLabelText('Buscar en el catálogo…');
    await user.type(input, ' uñas ');
    return fireEvent(input, 'submitEditing').then(() => {
      expect(push).toHaveBeenCalledWith({ pathname: '/catalogo', params: { q: 'uñas' } });
    });
  });
});

test('muestra la cita real una vez y abre Agenda', () => {
  const user = userEvent.setup();
  return render(<InicioView />).then(async () => {
    expect(screen.getAllByText('Tu próxima cita')).toHaveLength(1);
    expect(screen.getByText('Pedicura clínica')).toBeTruthy();
    expect(screen.getByText(/30 de octubre/)).toBeTruthy();
    await user.press(screen.getByRole('button', { name: 'Ver mi cita' }));
    expect(push).toHaveBeenCalledWith('/agenda');
  });
});

test('sin citas futuras ofrece agendar sin inventar una reserva', () => {
  (useInicioViewModel as jest.Mock).mockReturnValue(homeVm({ proximaCita: undefined, agenda: { cargando: false, error: null, recargar: jest.fn(), datos: [] } }));
  const user = userEvent.setup();
  return render(<InicioView />).then(async () => {
    expect(screen.getByText('Aún no tienes citas programadas')).toBeTruthy();
    await user.press(screen.getByRole('button', { name: 'Agendar cita' }));
    expect(push).toHaveBeenCalledWith('/agenda');
  });
});

test('sin sesión no muestra detalles privados y ofrece iniciar sesión', () => {
  (useInicioViewModel as jest.Mock).mockReturnValue(homeVm({ status: 'anonymous', saludo: 'Hola', proximaCita: undefined }));
  return render(<InicioView />).then(() => {
    expect(screen.getByText('Inicia sesión para ver tu próxima cita.')).toBeTruthy();
    expect(screen.queryByText('Pedicura clínica')).toBeNull();
    expect(screen.getByRole('button', { name: 'Iniciar sesión' })).toBeTruthy();
  });
});

test('un error de citas permite reintentar y no se presenta como ausencia confirmada', () => {
  const recargar = jest.fn(async () => {});
  (useInicioViewModel as jest.Mock).mockReturnValue(homeVm({ proximaCita: undefined, agenda: { cargando: false, error: 'No fue posible conectar.', recargar, datos: null } }));
  const user = userEvent.setup();
  return render(<InicioView />).then(async () => {
    expect(screen.getByText('No fue posible conectar.')).toBeTruthy();
    expect(screen.queryByText('Aún no tienes citas programadas')).toBeNull();
    await user.press(screen.getByRole('button', { name: 'Reintentar citas' }));
    expect(recargar).toHaveBeenCalledTimes(1);
  });
});

test('Inicio termina en la próxima cita sin listados inferiores ni precios', () => {
  return render(<InicioView />).then(() => {
    expect(screen.queryByText('Servicios destacados')).toBeNull();
    expect(screen.queryByText('Ver todos')).toBeNull();
    expect(screen.queryByText(/\$350/)).toBeNull();
    expect(screen.getByRole('button', { name: 'Productos' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Servicios' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Cursos' })).toBeTruthy();
  });
});
