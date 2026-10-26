import { fireEvent, render, screen } from '@testing-library/react-native';

import { FavoriteButton } from '@/components/ui/favorite-button';
import { BottomNavigationItems, showsBottomNavigation } from '@/constants/navigation';

jest.mock('@/components/ui/icon', () => ({ Icon: () => null }));

test('Carrito usa la misma barra inferior y las pantallas de acceso mantienen el espacio libre', () => {
  expect(BottomNavigationItems.map((item) => item.label)).toEqual(['Inicio', 'Catálogo', 'Agenda', 'Carrito', 'Perfil']);
  expect(showsBottomNavigation('/carrito')).toBe(true);
  expect(showsBottomNavigation('/autenticacion')).toBe(false);
});

test('el corazón conserva un objetivo táctil accesible y ejecuta la acción de favorito', async () => {
  const onPress = jest.fn();
  await render(<FavoriteButton title="Curso de peinado" selected={false} onPress={onPress} />);
  const button = screen.getByRole('button', { name: 'Agregar a favoritos: Curso de peinado' });
  expect(button.props.accessibilityState.selected).toBe(false);
  fireEvent.press(button);
  expect(onPress).toHaveBeenCalledTimes(1);
});
