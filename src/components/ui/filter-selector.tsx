import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { Icon } from './icon';
import { Colors, Radius, Sizes, Spacing } from '@/theme';

export function FilterSelector({ label, options, selected, onSelect }: { label: string; options: readonly string[]; selected: string; onSelect: (value: string) => void }) {
  const [open, setOpen] = useState(false);
  return <View style={styles.group}>
    <ThemedText type="label">{label}</ThemedText>
    <Pressable accessibilityRole="button" accessibilityState={{ expanded: open }} onPress={() => setOpen(!open)} style={styles.trigger}>
      <ThemedText type="small" style={styles.value}>{selected}</ThemedText>
      <Icon name="chevron-right" size={16} color={Colors.textSecondary} />
    </Pressable>
    {open ? <View accessibilityRole="radiogroup" style={styles.options}>{options.map(option => <Pressable key={option} accessibilityRole="radio" accessibilityState={{ checked: option === selected }} onPress={() => { onSelect(option); setOpen(false); }} style={styles.option}>
      <ThemedText type="small" themeColor={option === selected ? 'primary' : 'text'}>{option}</ThemedText>
      {option === selected ? <ThemedText type="label" themeColor="primary">✓</ThemedText> : null}
    </Pressable>)}</View> : null}
  </View>;
}

const styles = StyleSheet.create({
  group: { gap: Spacing.two },
  trigger: { minHeight: Sizes.controlMinHeight, flexDirection: 'row', alignItems: 'center', gap: Spacing.two, paddingHorizontal: Spacing.three, backgroundColor: Colors.backgroundElement, borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.control },
  value: { flex: 1 },
  options: { borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.control, overflow: 'hidden' },
  option: { minHeight: Sizes.touchMinWidth, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.three, borderBottomWidth: 1, borderBottomColor: Colors.border, backgroundColor: Colors.backgroundElement },
});
