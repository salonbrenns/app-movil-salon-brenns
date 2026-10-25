import type { ReactNode } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Colors, Radius, Shadows, Sizes, Spacing } from '@/theme';

export function FilterSheet({ visible, onClose, children }: { visible: boolean; onClose: () => void; children: ReactNode }) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} accessibilityLabel="Cerrar filtros" onPress={onClose} />
        <SafeAreaView edges={['bottom']} style={styles.sheet}>
          <View style={styles.heading}>
            <ThemedText type="subtitle" accessibilityRole="header" style={styles.title}>Filtros y orden</ThemedText>
            <Pressable accessibilityRole="button" accessibilityLabel="Cerrar filtros" onPress={onClose} style={styles.close}>
              <Icon name="close" size={20} />
            </Pressable>
          </View>
          <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
            {children}
            <Button label="Ver resultados" onPress={onClose} />
          </ScrollView>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, backgroundColor: Colors.scrim },
  sheet: { maxHeight: '78%', backgroundColor: Colors.backgroundElement, borderTopLeftRadius: Radius.card + 8, borderTopRightRadius: Radius.card + 8, ...Shadows.card },
  heading: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.four, paddingTop: Spacing.three },
  title: { flex: 1 },
  close: { minWidth: Sizes.touchMinWidth, minHeight: Sizes.touchMinWidth, alignItems: 'center', justifyContent: 'center' },
  content: { gap: Spacing.four, paddingHorizontal: Spacing.four, paddingTop: Spacing.two, paddingBottom: Spacing.four },
});
