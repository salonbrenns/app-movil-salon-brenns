import { Pressable, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';

import { Icon } from '@/components/ui/icon';
import { useTheme } from '@/hooks/use-theme';
import { IconSizes, Sizes } from '@/theme';

export function FavoriteButton({ title, selected, disabled = false, busy = false, onPress, style }: {
  title: string;
  selected: boolean;
  disabled?: boolean;
  busy?: boolean;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
}) {
  const theme = useTheme();
  return <Pressable
    accessibilityRole="button"
    accessibilityLabel={`${selected ? 'Quitar de' : 'Agregar a'} favoritos: ${title}`}
    accessibilityState={{ selected, disabled: disabled || busy, busy }}
    disabled={disabled || busy}
    onPress={onPress}
    style={({ pressed }) => [styles.button, { backgroundColor: theme.backgroundElement }, pressed && styles.pressed, style]}>
    <Icon name="heart" size={IconSizes.medium} color={selected ? theme.primary : theme.inactive} filled={selected} />
  </Pressable>;
}

const styles = StyleSheet.create({
  button: { width: Sizes.touchMinWidth, height: Sizes.touchMinWidth, alignItems: 'center', justifyContent: 'center', borderRadius: Sizes.touchMinWidth / 2 },
  pressed: { opacity: 0.75 },
});
