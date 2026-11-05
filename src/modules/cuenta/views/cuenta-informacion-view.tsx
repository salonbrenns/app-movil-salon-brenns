import Constants from 'expo-constants';
import { View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MenuRow } from '@/components/ui/style-guide';
import { accountSectionStyles as styles } from '@/components/ui/account-section-styles';
import { BrandLogo } from '@/components/layout/brand-logo';
import { FaqView } from '@/modules/legal/views/faq-view';
import { LegalDocumentView } from '@/modules/legal/views/legal-document-view';
import { SupportContact } from '@/modules/legal/components/support-contact';
import { ArcoRequestView } from '@/modules/legal/views/arco-request-view';
import { AccountDeletionView } from '@/modules/legal/views/account-deletion-view';
import { business } from '@/modules/legal/data/business';

function Notice({ title, detail }: { title: string; detail: string }) {
  return <ThemedView surface="card" style={styles.section}>
    <ThemedText type="subtitle">{title}</ThemedText>
    <ThemedText type="small" themeColor="textSecondary">{detail}</ThemedText>
  </ThemedView>;
}

export function CuentaInformacionView({ seccion }: { seccion: string }) {
  switch (seccion) {
    case 'configuracion': return <View style={styles.section}>
      <MenuRow label="Apariencia" description="Tema claro de Brenn’s" icon="settings" href="/cuenta/apariencia" />
      <MenuRow label="Seguridad" description="Acceso y cuenta" icon="settings" href="/cuenta/seguridad" />
      <MenuRow label="Información legal" href="/cuenta/legal" />
      <MenuRow label="Ayuda" href="/cuenta/ayuda" />
    </View>;
    case 'apariencia': return <Notice title="Tema claro" detail="La aplicación utiliza la identidad rosa de Salón Brenn’s. Actualmente no hay otros temas configurados." />;
    case 'eliminar-cuenta': return <View style={styles.section}><LegalDocumentView documentKey="eliminacion" /><AccountDeletionView /></View>;
    case 'ayuda': return <View style={styles.section}>
      <MenuRow label="Preguntas frecuentes" href="/cuenta/preguntas-frecuentes" />
      <MenuRow label="Derechos ARCO" href="/cuenta/arco" />
      <SupportContact />
    </View>;
    case 'preguntas-frecuentes': return <FaqView />;
    case 'legal': return <View style={styles.section}>
      <MenuRow label="Aviso de privacidad" href="/cuenta/privacidad" />
      <MenuRow label="Términos y condiciones" href="/cuenta/terminos" />
      <MenuRow label="Políticas de cancelaciones, devoluciones y garantías" href="/cuenta/politicas" />
      <MenuRow label="Compras y recogida en tienda" href="/cuenta/compras-recogida" />
      <MenuRow label="Derechos ARCO" href="/cuenta/arco" />
      <MenuRow label="Solicitar eliminación de cuenta" href="/cuenta/eliminar-cuenta" />
    </View>;
    case 'privacidad': return <LegalDocumentView documentKey="privacidad" />;
    case 'terminos': return <LegalDocumentView documentKey="terminos" />;
    case 'compras-recogida': return <LegalDocumentView documentKey="compras" />;
    case 'arco': return <View style={styles.section}><LegalDocumentView documentKey="arco" /><ArcoRequestView /></View>;
    case 'politicas':
    case 'cancelaciones': return <LegalDocumentView documentKey="politicas" />;
    case 'acerca': return <View style={styles.section}>
      <BrandLogo size={120} />
      <Notice title={business.name} detail="Belleza · Estilo · Formación" />
      <ThemedView surface="card" style={styles.section}>
        <ThemedText type="label">Dirección del establecimiento</ThemedText>
        <ThemedText>{business.address}</ThemedText>
        <ThemedText type="small" themeColor="textSecondary">Referencia para llegar: {business.directions}</ThemedText>
        <ThemedText selectable type="small" themeColor="primary">{business.email}</ThemedText>
      </ThemedView>
      <ThemedText type="small" themeColor="textSecondary">Versión {Constants.expoConfig?.version ?? 'no disponible'}</ThemedText>
    </View>;
    default: return <Notice title="Sección no disponible" detail="No hay datos disponibles para esta sección." />;
  }
}
