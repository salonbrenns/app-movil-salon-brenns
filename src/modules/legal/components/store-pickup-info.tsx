import { View, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { business } from '../data/business';
import { Spacing } from '@/theme';

export function StorePickupInfo() {
  return <ThemedView surface="card" style={styles.card}>
    <ThemedText type="subtitle">Recogida en tienda</ThemedText>
    <ThemedText>Los productos se recogen cuando se confirme que tu pedido está disponible.</ThemedText>
    <View style={styles.address}>
      <ThemedText type="label">{business.name}</ThemedText>
      <ThemedText>{business.address}</ThemedText>
      <ThemedText type="small" themeColor="textSecondary">Referencia: {business.directions}</ThemedText>
    </View>
  </ThemedView>;
}

const styles = StyleSheet.create({ card: { gap: Spacing.two }, address: { gap: Spacing.one } });
