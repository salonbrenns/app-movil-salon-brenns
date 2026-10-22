import { StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { Button } from './button';
import { Spacing } from '@/theme';

type PaginationControlsProps = {
  currentPage: number;
  totalPages: number;
  canPrevious: boolean;
  canNext: boolean;
  previous: () => void;
  next: () => void;
};

export function PaginationControls({ currentPage, totalPages, canPrevious, canNext, previous, next }: PaginationControlsProps) {
  if (totalPages <= 1) return null;
  return <View style={styles.row} accessibilityLabel="Paginación">
    <Button label="Anterior" variant="secondary" disabled={!canPrevious} onPress={previous} />
    <ThemedText type="small" accessibilityRole="text">Página {currentPage} de {totalPages}</ThemedText>
    <Button label="Siguiente" variant="secondary" disabled={!canNext} onPress={next} />
  </View>;
}

const styles = StyleSheet.create({ row: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: Spacing.two } });
