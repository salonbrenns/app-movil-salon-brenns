import { Link, type Href } from 'expo-router';
import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Touchable } from '@/components/ui/touchable';
import { Sizes, Spacing } from '@/theme';

export function TextLink({ href, label }: { href: Href; label: string }) {
  return <Link href={href} push asChild>
    <Touchable accessibilityRole="link" accessibilityLabel={label} style={styles.link}>
      <ThemedText type="small" themeColor="primary" style={styles.label}>{label}</ThemedText>
    </Touchable>
  </Link>;
}

const styles = StyleSheet.create({
  link: { minHeight: Sizes.touchMinWidth, alignSelf: 'flex-start', justifyContent: 'center', paddingVertical: Spacing.two },
  label: { textDecorationLine: 'underline' },
});
