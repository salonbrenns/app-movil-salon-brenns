import * as Linking from 'expo-linking';
import { useState } from 'react';
import { View, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { SupportContact } from '@/modules/legal/components/support-contact';
import { getLegalDocument, type LegalDocumentKey } from '@/modules/legal/data/documents';
import { TextLink } from '@/components/ui/text-link';
import { Touchable } from '@/components/ui/touchable';
import { Sizes, Spacing } from '@/theme';

const PRIVACY_URL = 'https://brenns-sistema.vercel.app/privacidad-movil';

export function LegalDocumentView({ documentKey }: { documentKey: LegalDocumentKey }) {
  const document = getLegalDocument(documentKey);
  const [linkError, setLinkError] = useState(false);

  function openPrivacyNotice() {
    setLinkError(false);
    void Linking.openURL(PRIVACY_URL).catch(() => { setLinkError(true); });
  }

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
    {documentKey === 'privacidad' ? <>
      <Touchable accessibilityRole="link" accessibilityLabel="Consultar aviso de privacidad completo" onPress={openPrivacyNotice} style={styles.externalLink}>
        <ThemedText type="small" themeColor="primary" style={styles.externalLinkLabel}>Consultar aviso de privacidad completo</ThemedText>
      </Touchable>
      {linkError ? <ThemedText type="small" themeColor="textSecondary">No se pudo abrir el aviso en el navegador. Copia esta dirección para consultarlo:</ThemedText> : null}
      {linkError ? <ThemedText selectable type="smallBold" themeColor="primary">{PRIVACY_URL}</ThemedText> : null}
      <TextLink label="Ejercer derechos ARCO" href="/cuenta/arco" />
    </> : null}
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
  externalLink: { minHeight: Sizes.touchMinWidth, alignSelf: 'flex-start', justifyContent: 'center', paddingVertical: Spacing.two },
  externalLinkLabel: { textDecorationLine: 'underline' },
});
