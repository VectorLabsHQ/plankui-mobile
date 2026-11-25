'use no memo'; // Animated values are mutated outside render; React Compiler memoisation freezes them.
import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { AccessibilityInfo, Animated, Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ND, useTheme } from '../theme';
import { haptic } from '../haptics';
import { Text } from './Text';

export type ToastOptions = {
  message: string;
  /** One optional action, e.g. Undo. */
  action?: { label: string; onPress: () => void };
  tone?: 'default' | 'success' | 'error';
  /** ms. Default 4000, or 6000 when there is an action. */
  duration?: number;
};

type Show = (o: ToastOptions | string) => void;
const Ctx = createContext<Show | null>(null);

/** const toast = useToast(); toast('Saved') or toast({ message, action }). */
export function useToast(): Show {
  const s = useContext(Ctx);
  if (!s) throw new Error('PlankUI Mobile: wrap your app in <ToastProvider>.');
  return s;
}

export type ToastProviderProps = {
  children: ReactNode;
  /** Space kept clear at the bottom on Android, e.g. the tab bar height. */
  bottomOffset?: number;
};

/**
 * iOS: a pill that drops from the top. Android: a Material snackbar at the bottom.
 * One at a time; a new toast replaces the old one. Screen readers announce it.
 */
export function ToastProvider({ children, bottomOffset = 0 }: ToastProviderProps) {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const android = t.os === 'android';
  const [toast, setToast] = useState<(ToastOptions & { id: number }) | null>(null);
  const a = useRef(new Animated.Value(0)).current;
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const hide = useCallback(() => {
    clearTimeout(timer.current);
    Animated.timing(a, { toValue: 0, duration: 180, useNativeDriver: ND }).start(() => setToast(null));
  }, [a]);

  const show = useCallback<Show>(
    (o) => {
      const opts = typeof o === 'string' ? { message: o } : o;
      setToast({ ...opts, id: Date.now() });
      if (opts.tone === 'success') haptic('success');
      if (opts.tone === 'error') haptic('error');
      AccessibilityInfo.announceForAccessibility(opts.message);
    },
    [],
  );

  useEffect(() => {
    if (!toast) return;
    a.setValue(0);
    Animated.spring(a, { toValue: 1, useNativeDriver: ND, damping: 18, stiffness: 220 }).start();
    clearTimeout(timer.current);
    timer.current = setTimeout(hide, toast.duration ?? (toast.action ? 6000 : 4000));
    return () => clearTimeout(timer.current);
  }, [toast?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const dot = toast?.tone === 'success' ? t.c.success : toast?.tone === 'error' ? t.c.danger : null;

  return (
    <Ctx.Provider value={show}>
      {children}
      {toast ? (
        <Animated.View
          pointerEvents="box-none"
          accessibilityLiveRegion="polite"
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            alignItems: 'center',
            paddingHorizontal: android ? 12 : 16,
            ...(android ? { bottom: insets.bottom + bottomOffset + 12 } : { top: insets.top + 8 }),
            opacity: a,
            transform: [{ translateY: a.interpolate({ inputRange: [0, 1], outputRange: [android ? 24 : -40, 0] }) }],
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 10,
              width: android ? '100%' : undefined,
              maxWidth: 560,
              minHeight: android ? 48 : 44,
              paddingLeft: 16,
              paddingRight: toast.action ? 6 : 16,
              ...(android ? null : t.look.card),
              borderRadius: t.look.r(android ? 4 : 22),
              backgroundColor: android ? t.c.inverse : t.look.name === 'glass' ? (t.look.card.backgroundColor as string) : t.c.surface,
              ...(android || t.look.card.borderWidth ? null : { borderWidth: 0.5, borderColor: t.c.rule }),
              shadowColor: '#000',
              shadowOpacity: 0.15,
              shadowRadius: 16,
              shadowOffset: { width: 0, height: 6 },
              elevation: 6,
            }}
          >
            {dot ? <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: dot }} /> : null}
            <Text variant={android ? 'subhead' : 'subhead'} weight={android ? '400' : '500'} style={{ flexShrink: 1, paddingVertical: 12, color: android ? t.c.onInverse : t.c.ink }}>
              {toast.message}
            </Text>
            {toast.action ? (
              <Pressable
                onPress={() => {
                  toast.action!.onPress();
                  hide();
                }}
                accessibilityRole="button"
                style={{ minHeight: t.hit, paddingHorizontal: 10, justifyContent: 'center', marginLeft: android ? 'auto' : 0 }}
              >
                <Text variant="subhead" weight="600" style={{ color: android ? withInverseAccent(t.scheme) : t.c.accent }}>
                  {toast.action.label}
                </Text>
              </Pressable>
            ) : null}
          </View>
        </Animated.View>
      ) : null}
    </Ctx.Provider>
  );
}

// Material "inverse primary": a light accent on the dark snackbar, a dark one on the light snackbar.
const withInverseAccent = (scheme: 'light' | 'dark') => (scheme === 'dark' ? '#1e64ef' : '#9dbcff');
