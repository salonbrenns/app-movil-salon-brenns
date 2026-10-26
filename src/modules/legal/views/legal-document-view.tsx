import { View, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { SupportContact } from '@/modules/legal/components/support-contact';
import { legalDocuments, type LegalDocumentKey } from '@/modules/legal/data/documents';
import { TextLink } from '@/components/ui/text-link';
import { Spacing } from '@/theme';

export function LegalDocumentView({ documentKey }: { documentKey: LegalDocumentKey }) {
  const document = legalDocuments[documentKey];
  return <View style={styles.page}>
    {document.status === 'approved' && document.version && document.updatedAt
      ? <ThemedText type="small" themeColor="textSecondary">Versión {document.version} · Última actualización: {document.updatedAt}</ThemedText>
      : null}
    {document.sections.map((section) => <ThemedView key={section.number} surface="card" style={styles.section}>
      <ThemedText type="subtitle">{section.number}. {section.title}</ThemedText>
      {section.blocks.map((block, index) => block.kind === 'list'
        ? <View key={index} style={styles.list}>{block.items?.map((item) => <ThemedText key={item}>• {item}</ThemedText>)}</View>
        : <ThemedText key={index} type={block.kind === 'subheading' ? 'label' : 'default'}>{block.text}</ThemedText>)}
    </ThemedView>)}
    {documentKey === 'privacidad' ? <TextLink label="Ejercer derechos ARCO" href="/cuenta/arco" /> : null}
    {documentKey === 'terminos' ? <>
      <TextLink label="Políticas de cancelaciones, devoluciones y garantías" href="/cuenta/politicas" />
      <TextLink label="Compras y recogida en tienda" href="/cuenta/compras-recogida" />
    </> : null}
    {documentKey !== 'arco' && documentKey !== 'eliminacion' ? <SupportContact legal /> : null}
  </View>;
}

const styles = StyleSheet.create({
  page: { gap: Spacing.three },
  section: { gap: Spacing.two },
  list: { gap: Spacing.one, paddingLeft: Spacing.two },
});
