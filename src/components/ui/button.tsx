import { forwardRef, type ReactNode } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, type PressableInstance, type PressableProps } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ControlStates, Radius, Shadows, Sizes, Spacing, Surfaces, Typography } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type ButtonProps = PressableProps & {
  label: string;
  variant?: 'primary' | 'secondary';
  loading?: boolean;
  icon?: ReactNode;
};

export const Button = forwardRef<PressableInstance, ButtonProps>(function Button(
  { label, variant = 'primary', loading = false, icon, disabled: disabledProp, style, accessibilityState, ...props },
  ref,
) {
  const theme = useTheme();
  const primary = variant === 'primary';
  const disabled = !!disabledProp || loading;

  return (
    <Pressable
      ref={ref}
      accessibilityRole="button"
      accessibilityLabel={label}
      {...props}
      disabled={disabled}
      accessibilityState={{ ...accessibilityState, disabled: !!disabled, busy: loading }}
      style={(state) => [
        styles.button,
        {
          backgroundColor: primary
            ? theme.primary
            : state.pressed && !disabled
              ? ControlStates.secondaryPressedBackground
              : Surfaces.control,
          borderColor: primary ? theme.primary : theme.borderAccent,
          opacity: disabled
            ? ControlStates.opacity.disabled
            : ControlStates.opacity.default,
        },
        state.pressed && !disabled ? { transform: [{ scale: 0.98 }] } : undefined,
        typeof style === 'function' ? style(state) : style,
      ]}>
      {icon}{loading ? <ActivityIndicator color={primary ? theme.onPrimary : theme.primary} /> : <ThemedText themeColor={primary ? 'onPrimary' : 'primary'} style={styles.label}>
        {label}
      </ThemedText>}
    </Pressable>
  );
});

const styles = StyleSheet.create({
  button: {
    minHeight: Sizes.controlMinHeight,
    minWidth: Sizes.touchMinWidth,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: Sizes.borderWidth,
    borderRadius: Radius.control,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    ...Shadows.control,
  },
  label: {
    ...Typography.action,
    textAlign: 'center',
  },
});

export { Button as CustomButton };
