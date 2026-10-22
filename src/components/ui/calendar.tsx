import { Pressable, StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { Button } from './button';
import { useTheme } from '@/hooks/use-theme';
import { Radius, Sizes, Spacing } from '@/theme';
import type { useCalendarViewModel } from '@/shared/viewmodels/use-calendar-view-model';

type CalendarProps = {
  vm: ReturnType<typeof useCalendarViewModel>;
  selected: string;
  onSelect: (day: string) => void;
  disabled: boolean;
};

const weekdays = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá', 'Do'];

export function Calendar({ vm, selected, onSelect, disabled }: CalendarProps) {
  const theme = useTheme();
  return <View accessibilityLabel="Calendario de reservas" style={styles.container}>
    <View style={styles.header}>
      <Button label="‹" accessibilityLabel="Mes anterior" variant="secondary" disabled={disabled || !vm.canPrevious} onPress={vm.previous} />
      <ThemedText type="label" accessibilityRole="header" style={styles.title}>{vm.title}</ThemedText>
      <Button label="›" accessibilityLabel="Mes siguiente" variant="secondary" disabled={disabled} onPress={vm.next} />
    </View>
    <View style={styles.grid}>
      {weekdays.map((label) => <View key={label} style={styles.cell}><ThemedText type="small" themeColor="textSecondary" style={styles.center}>{label}</ThemedText></View>)}
      {vm.cells.map((cell, index) => <View key={cell?.day ?? `empty-${index}`} style={styles.cell}>
        {cell ? <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Seleccionar ${cell.day}`}
          accessibilityState={{ selected: selected === cell.day, disabled: disabled || !cell.selectable }}
          disabled={disabled || !cell.selectable}
          onPress={() => { onSelect(cell.day); }}
          style={[styles.day, { backgroundColor: selected === cell.day ? theme.primary : theme.backgroundElement, borderColor: theme.border, opacity: disabled || !cell.selectable ? 0.45 : 1 }]}
        ><ThemedText type="label" themeColor={selected === cell.day ? 'onPrimary' : 'text'}>{cell.number}</ThemedText></Pressable> : null}
      </View>)}
    </View>
  </View>;
}

const styles = StyleSheet.create({
  container: { gap: Spacing.two },
  header: { flexDirection: 'row', alignItems: 'center', gap: Spacing.one },
  title: { flex: 1, textAlign: 'center', textTransform: 'capitalize' },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  cell: { width: '14.2857%', alignItems: 'center', justifyContent: 'center', padding: 2 },
  center: { textAlign: 'center' },
  day: { minHeight: Sizes.touchMinWidth, width: '100%', borderWidth: Sizes.borderWidth, borderRadius: Radius.control, alignItems: 'center', justifyContent: 'center' },
});
