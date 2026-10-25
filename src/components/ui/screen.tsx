import { usePathname, type Href } from 'expo-router';
import { createContext, useCallback, useContext, useEffect, useRef, type ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppHeader } from '@/components/layout/app-header';
import { showsBottomNavigation } from '@/constants/navigation';
import { Sizes, Spacing } from '@/theme';
import { useTheme } from '@/hooks/use-theme';

export type ScreenProps = {
  title?: string;
  subtitle?: string;
  backHref?: Href;
  onBack?: () => boolean;
  brand?: boolean;
  compactHeader?: boolean;
  headerActions?: ReactNode;
  children?: ReactNode;
};

const ScreenBackActionContext = createContext<React.RefObject<(() => void) | null> | null>(null);

export function useScreenBackAction(active: boolean, action: () => void) {
  const actionRef = useContext(ScreenBackActionContext);
  useEffect(() => {
    if (!active || !actionRef) return;
    actionRef.current = action;
    return () => { if (actionRef.current === action) actionRef.current = null; };
  }, [active, action, actionRef]);
}

export function Screen({ title, subtitle, backHref, onBack, brand, compactHeader, headerActions, children }: ScreenProps) {
  const hasBottomNavigation = showsBottomNavigation(usePathname());
  const theme = useTheme();
  const backAction = useRef<(() => void) | null>(null);
  const handleBack = useCallback(() => {
    if (backAction.current) {
      backAction.current();
      return true;
    }
    return onBack?.() ?? false;
  }, [onBack]);
  return (
    <ScreenBackActionContext.Provider value={backAction}><SafeAreaView
      edges={hasBottomNavigation ? ['top', 'left', 'right'] : ['top', 'left', 'right', 'bottom']}
      style={[styles.screen, { backgroundColor: theme.background }]}>
      <KeyboardAvoidingView
        style={styles.screen}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          style={styles.screen}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag">
          <View style={styles.content}>
            <AppHeader title={title} subtitle={subtitle} backHref={backHref} onBack={handleBack} brand={brand} compact={compactHeader} actions={headerActions} />
            {children}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView></ScreenBackActionContext.Provider>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: Spacing.four,
    paddingBottom: Spacing.four,
  },
  content: {
    width: '100%',
    maxWidth: Sizes.maxContentWidth,
    alignSelf: 'center',
    gap: Spacing.four,
  },
});
