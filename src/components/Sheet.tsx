'use no memo'; // Animated values are mutated outside render; React Compiler memoisation freezes them.
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Animated, Dimensions, KeyboardAvoidingView, Modal, PanResponder, Platform, Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ND, useTheme } from '../theme';
import { Text } from './Text';

export type SheetProps = {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  /** Swipe down or tap outside to close. Turn off for steps the user must finish. */
  dismissible?: boolean;
};

/**
 * Bottom sheet: slides up, follows the finger, closes on a swipe down, a tap outside,
 * Android back or Escape on web. Grows with its content up to 90% of the screen
 * and moves above the keyboard.
 */
export function Sheet({ open, onClose, title, children, dismissible = true }: SheetProps) {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const H = Dimensions.get('window').height;
  const [mounted, setMounted] = useState(open);
  const y = useRef(new Animated.Value(H)).current;
  const fade = useRef(new Animated.Value(0)).current;
  const close = useRef(onClose);
  close.current = onClose;
  const dismissibleRef = useRef(dismissible);
  dismissibleRef.current = dismissible;

  useEffect(() => {
    if (open) {
      setMounted(true);
      Animated.parallel([
        Animated.spring(y, { toValue: 0, useNativeDriver: ND, damping: 26, stiffness: 260, mass: 1 }),
        Animated.timing(fade, { toValue: 1, duration: 220, useNativeDriver: ND }),
      ]).start();
    } else if (mounted) {
      Animated.parallel([
        Animated.timing(y, { toValue: H, duration: 220, useNativeDriver: ND }),
        Animated.timing(fade, { toValue: 0, duration: 220, useNativeDriver: ND }),
      ]).start(() => setMounted(false));
    }
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  const pan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true, // the handle area has nothing else to press
      onMoveShouldSetPanResponder: (_, g) => g.dy > 4 && Math.abs(g.dy) > Math.abs(g.dx),
      onPanResponderMove: (_, g) => y.setValue(g.dy > 0 ? g.dy : g.dy / 6), // resist upward drag
      onPanResponderRelease: (_, g) => {
        if (dismissibleRef.current && (g.dy > 120 || g.vy > 0.9)) close.current();
        else Animated.spring(y, { toValue: 0, useNativeDriver: ND, damping: 24, stiffness: 300 }).start();
      },
    }),
  ).current;

  if (!mounted) return null;
  return (
    <Modal transparent visible animationType="none" statusBarTranslucent navigationBarTranslucent onRequestClose={() => {
      if (dismissible) onClose();
    }}>
      <Animated.View style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, backgroundColor: t.c.overlay, opacity: fade }}>
        <Pressable style={{ flex: 1 }} onPress={() => dismissible && onClose()} accessibilityRole="button" accessibilityLabel="Close" />
      </Animated.View>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1, justifyContent: 'flex-end' }} pointerEvents="box-none">
        <Animated.View
          accessibilityViewIsModal
          style={{
            maxHeight: H * 0.9,
            width: '100%',
            maxWidth: 640,
            alignSelf: 'center',
            backgroundColor: t.c.surface,
            ...(t.look.name === 'brutal' ? { borderWidth: 2, borderColor: t.c.ink } : null),
            borderTopLeftRadius: t.look.r(12),
            borderTopRightRadius: t.look.r(12),
            paddingBottom: Math.max(insets.bottom, 16),
            transform: [{ translateY: y }],
          }}
        >
          <View {...pan.panHandlers} style={{ ...({ userSelect: 'none' } as object), paddingTop: 6, paddingBottom: title ? 4 : 12, alignItems: 'center' }}>
            <View style={{ width: 36, height: 5, borderRadius: 3, backgroundColor: t.c.muted, opacity: 0.5 }} />
            {title ? (
              <Text variant="headline" accessibilityRole="header" style={{ marginTop: 12, marginBottom: 8, alignSelf: 'center', paddingHorizontal: 16 }}>
                {title}
              </Text>
            ) : null}
          </View>
          <View style={{ paddingHorizontal: 16, flexShrink: 1 }}>{children}</View>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
