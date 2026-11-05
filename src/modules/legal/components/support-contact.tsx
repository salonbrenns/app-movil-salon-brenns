import * as Linking from 'expo-linking';
import { useState } from 'react';
import { View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Spacing } from '@/theme';
import { business } from '../data/business';

export const SUPPORT_EMAIL = business.email;

export function SupportContact({ showHeading = false, legal = false }: { showHeading?: boolean; legal?: boolean }) {
  const [error, setError] = useState(false);
  function openEmail() {
    setError(false);
    void Linking.openURL(`mailto:${SUPPORT_EMAIL}`).catch(() => { setError(true); });
  }
  return <View style={{ gap: Spacing.two }}>
    {showHeading ? <ThemedText type="subtitle">¿Necesitas más ayuda?</ThemedText> : null}
    <ThemedText type="small" themeColor="textSecondary">{legal ? 'Para dudas sobre este documento, escríbenos a ' : 'Si no encontraste la respuesta que buscabas, contáctanos en '}{SUPPORT_EMAIL}.</ThemedText>
    <Button label="Contactar soporte" onPress={openEmail} />
    {error ? <ThemedText type="small" themeColor="textSecondary">No se pudo abrir la aplicación de correo. Mantén presionada la dirección para copiarla y escríbenos manualmente.</ThemedText> : null}
    {error ? <ThemedText selectable type="smallBold" themeColor="primary">{SUPPORT_EMAIL}</ThemedText> : null}
  </View>;
}
