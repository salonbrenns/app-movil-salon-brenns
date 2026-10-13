import { FontDisplay, useFonts } from 'expo-font';
import { DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';

import { BottomNavigation } from '@/components/navigation/bottom-navigation';
import { NavigationSections } from '@/constants/navigation';
import { Fonts, NavigationFonts, Typography } from '@/theme';
import { useTheme } from '@/hooks/use-theme';
import { AuthSessionProvider } from '@/modules/auth/viewmodels/auth-session-provider';


SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  return <AuthSessionProvider><AppShell /></AuthSessionProvider>;
}

function AppShell() {
  const [fontsLoaded, fontError] = useFonts({
    [Fonts.regular]: {
      uri: require('../../assets/fonts/Inter-Regular.ttf'),
      display: FontDisplay.SWAP,
    },
    [Fonts.bold]: {
      uri: require('../../assets/fonts/Inter-Bold.ttf'),
      display: FontDisplay.SWAP,
    },
  });
  const colors = useTheme();
  const navigationTheme = {
    ...DefaultTheme,
    fonts: NavigationFonts,
    colors: {
      ...DefaultTheme.colors,
      primary: colors.primary,
      background: colors.background,
      card: colors.background,
      text: colors.text,
      border: colors.border,
      notification: colors.primary,
    },
  };

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hide();
    }
  }, [fontsLoaded, fontError]);


  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <ThemeProvider value={navigationTheme}>
      <View style={styles.root}>
        <Stack
          screenOptions={{
            headerShown: false,
            headerStyle: { backgroundColor: colors.background },
            headerTintColor: colors.text,
            headerTitleStyle: Typography.action,
            contentStyle: { backgroundColor: colors.background },
          }}>
          <Stack.Screen name="index" options={{ title: 'Inicio' }} />
          {Object.values(NavigationSections).map((section) => (
            <Stack.Screen key={section.name} name={section.name} options={{ title: section.title }} />
          ))}
          <Stack.Screen name="+not-found" options={{ title: 'Página no encontrada' }} />
          <Stack.Screen name="verificar-email" options={{ title: 'Verificar correo' }} />
          <Stack.Screen name="cuenta/[seccion]" options={{ title: 'Mi cuenta' }} />
        </Stack>
        <BottomNavigation />
      </View>
      <StatusBar style="dark" />
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({ root: { flex: 1 } });
