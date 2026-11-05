import { Link } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Icon } from '@/components/ui/icon';
import { faqs } from '@/modules/legal/data/faqs';
import { SupportContact } from '@/modules/legal/components/support-contact';
import { useFaqViewModel } from '@/modules/legal/viewmodels/use-faq-view-model';
import { useTheme } from '@/hooks/use-theme';
import { Radius, Sizes, Spacing } from '@/theme';

export function FaqView() {
  const vm = useFaqViewModel();
  const theme = useTheme();
  return <View style={styles.page}>
    <ThemedText themeColor="textSecondary">Encuentra respuestas sobre citas, pagos, pedidos y cursos.</ThemedText>
    {faqs.map((faq, index) => {
      const expanded = vm.expandedIndex === index;
      return <View key={faq.question} style={[styles.card, { borderColor: theme.border, backgroundColor: theme.backgroundElement }]}>
        <Pressable accessibilityRole="button" accessibilityState={{ expanded }} accessibilityLabel={faq.question} onPress={() => vm.toggle(index)} style={styles.question}>
          <ThemedText type="label" style={styles.questionText}>{faq.question}</ThemedText>
          <View style={expanded ? styles.expandedIcon : undefined}><Icon name="chevron-right" size={Sizes.text.body} color={theme.primary} /></View>
        </Pressable>
        {expanded ? <View style={styles.answer}>
          <ThemedText>{faq.answer}</ThemedText>
          {index === 2 ? <Link href="/cuenta/politicas" push><ThemedText type="label" themeColor="primary">Consultar Políticas</ThemedText></Link> : null}
        </View> : null}
      </View>;
    })}
    <SupportContact showHeading />
  </View>;
}

const styles = StyleSheet.create({
  page: { gap: Spacing.three },
  card: { borderWidth: Sizes.borderWidth, borderRadius: Radius.card, overflow: 'hidden' },
  question: { minHeight: Sizes.controlMinHeight, padding: Spacing.three, flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  questionText: { flex: 1 },
  expandedIcon: { transform: [{ rotate: '90deg' }] },
  answer: { paddingHorizontal: Spacing.three, paddingBottom: Spacing.three, gap: Spacing.two },
});
