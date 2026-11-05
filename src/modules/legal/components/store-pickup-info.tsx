import { View, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Icon } from '@/components/ui/icon';
import { business } from '../data/business';
import { Colors, Spacing } from '@/theme';

export function StorePickupInfo({ flat = false }: { flat?: boolean }) {
  return <ThemedView surface={flat ? undefined : 'card'} style={styles.card}>
    <View style={styles.heading}>{flat ? <Icon name="product" size={18} color={Colors.primary} /> : null}<ThemedText type="subtitle">Recogida en tienda</ThemedText></View>
    <ThemedText>Los productos se recogen cuando se confirme que tu pedido está disponible.</ThemedText>
    <View style={styles.address}>
      <ThemedText type="label">{business.name}</ThemedText>
      <ThemedText>{business.address}</ThemedText>
      <ThemedText type="small" themeColor="textSecondary">Referencia: {business.directions}</ThemedText>
    </View>
  </ThemedView>;
}

const styles = StyleSheet.create({ card: { gap: Spacing.two }, heading: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two }, address: { gap: Spacing.one } });
