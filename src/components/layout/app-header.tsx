import { router, useFocusEffect, type Href } from 'expo-router';
import { useCallback, type ReactNode } from 'react';
import { BackHandler, StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { BrandLogo } from './brand-logo';
import { Icon } from '@/components/ui/icon';
import { Touchable } from '@/components/ui/touchable';
import { Sizes, Spacing } from '@/theme';

export type AppHeaderProps = Readonly<{ title?: string; subtitle?: string; backHref?: Href; onBack?: () => boolean; brand?: boolean; compact?: boolean; actions?: ReactNode }>;

export function AppHeader({ title, subtitle, backHref, onBack, brand, compact, actions }: AppHeaderProps) {
  const goBack = useCallback(() => {
    if (onBack?.()) return;
    if (router.canGoBack()) router.back();
    else if (backHref) router.replace(backHref);
  }, [backHref, onBack]);

  useFocusEffect(useCallback(() => {
    if (!backHref) return;
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      if (onBack?.()) return true;
      if (router.canGoBack()) return false;
      router.replace(backHref);
      return true;
    });
    return () => subscription.remove();
  }, [backHref, onBack]));

  if (!brand && !title && !subtitle && !actions) return null;
  return <View style={styles.container}>
    {brand ? <View style={styles.brand}><BrandLogo /></View> : null}
    {title ? <View style={styles.titleRow}>
      {backHref ? <Touchable accessibilityRole="button" accessibilityLabel="Regresar" onPress={goBack} style={styles.back}><Icon name="chevron-left" /></Touchable> : null}
      {title ? <ThemedText type={compact ? 'subtitle' : 'title'} accessibilityRole="header" style={styles.title}>{title}</ThemedText> : null}
      {actions}
    </View> : null}
    {subtitle ? <ThemedText themeColor="textSecondary">{subtitle}</ThemedText> : null}
  </View>;
}

const styles = StyleSheet.create({ container: { gap: Spacing.one }, brand: { marginBottom: Spacing.two }, titleRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two }, title: { flex: 1 }, back: { minWidth: Sizes.touchMinWidth, minHeight: Sizes.controlMinHeight, alignItems: 'center', justifyContent: 'center', borderRadius: Sizes.controlMinHeight / 2 } });
