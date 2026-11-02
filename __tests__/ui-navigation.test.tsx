import { render, screen, userEvent } from '@testing-library/react-native';

import { FavoriteButton } from '@/components/ui/favorite-button';
import { BottomNavigationItems, showsBottomNavigation } from '@/constants/navigation';

jest.mock('@/components/ui/icon', () => ({ Icon: () => null }));

test('Carrito usa la misma barra inferior y las pantallas de acceso mantienen el espacio libre', () => {
  expect(BottomNavigationItems.map((item) => item.label)).toEqual(['Inicio', 'Catálogo', 'Agenda', 'Carrito', 'Perfil']);
  expect(BottomNavigationItems.map((item) => item.icon)).toEqual(['home', 'catalog', 'agenda', 'cart', 'profile']);
  expect(showsBottomNavigation('/carrito')).toBe(true);
  for (const path of ['/finalizar-compra', '/pago', '/pago-servicio', '/pago-curso', '/cuenta/compras', '/cuenta/cursos', '/productos/1', '/servicios', '/cursos']) expect(showsBottomNavigation(path)).toBe(true);
  expect(showsBottomNavigation('/autenticacion')).toBe(false);
  expect(showsBottomNavigation('/cuenta/crear-cuenta')).toBe(false);
});

test('el corazón conserva un objetivo táctil accesible y ejecuta la acción de favorito', () => {
  const onPress = jest.fn();
  const user = userEvent.setup();
  return render(<FavoriteButton title="Curso de peinado" selected={false} onPress={onPress} />).then(async () => {
    const button = screen.getByRole('button', { name: 'Agregar a favoritos: Curso de peinado' });
    expect(button.props.accessibilityState.selected).toBe(false);
    await user.press(button);
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
