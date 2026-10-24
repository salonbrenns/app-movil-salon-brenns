import Constants from 'expo-constants';
import { View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MenuRow } from '@/components/ui/style-guide';
import { accountSectionStyles as styles } from '@/components/ui/account-section-styles';
import { BrandLogo } from '@/components/layout/brand-logo';

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
    </View>;
    case 'apariencia': return <Notice title="Tema claro" detail="La aplicación utiliza la identidad rosa de Salón Brenn’s. Actualmente no hay otros temas configurados." />;
    case 'eliminar-cuenta': return <Notice title="Eliminación no disponible" detail="Tu cuenta no se eliminará desde esta pantalla. Falta configurar la verificación de identidad y el endpoint de eliminación en el servidor." />;
    case 'direcciones': return <Notice title="Direcciones pendientes" detail="La API actual no ofrece guardar, editar ni consultar direcciones. Esta sección se habilitará cuando exista el contrato de entrega." />;
    case 'ayuda': return <View style={styles.section}>
      <Notice title="¿Cómo agendo una cita?" detail="En Catálogo, abre un servicio y selecciona una fecha y uno de los horarios disponibles." />
      <Notice title="¿Cómo consulto mis citas y cursos?" detail="Tus citas aparecen en Agenda y tus inscripciones en Perfil > Mis cursos." />
      <Notice title="¿Cómo pago?" detail="La app muestra los datos de transferencia configurados para el proyecto al iniciar una reserva o inscripción. El registro del pedido no acredita el pago." />
    </View>;
    case 'legal': return <View style={styles.section}>
      <MenuRow label="Aviso de privacidad" href="/cuenta/privacidad" />
      <MenuRow label="Términos y condiciones" href="/cuenta/terminos" />
      <MenuRow label="Cancelaciones y reembolsos" href="/cuenta/cancelaciones" />
    </View>;
    case 'privacidad':
    case 'terminos':
    case 'cancelaciones': return <Notice title="Contenido oficial pendiente" detail="El documento definitivo será proporcionado por Salón Brenn’s. Esta pantalla aún no constituye una política publicada." />;
    case 'acerca': return <View style={styles.section}>
      <BrandLogo size={120} />
      <Notice title="Salón Brenn’s" detail="Belleza · Estilo · Formación" />
      <ThemedText type="small" themeColor="textSecondary">Versión {Constants.expoConfig?.version ?? 'no disponible'}</ThemedText>
    </View>;
    default: return <Notice title="Sección no disponible" detail="No hay datos disponibles para esta sección." />;
  }
}
