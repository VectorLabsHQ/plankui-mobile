'use no memo'; // Animated values are mutated outside render; React Compiler memoisation freezes them.
import { useEffect, useRef } from 'react';
import { Animated, Modal, Pressable, View } from 'react-native';
import { ND, useTheme } from '../theme';
import { haptic } from '../haptics';
import { Text } from './Text';

export type DialogButton = { label: string; onPress?: () => void; style?: 'default' | 'cancel' | 'destructive' };

export type DialogProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  message?: string;
  /** Up to three. Put the cancel button first; it lands where each platform expects it. */
  buttons: DialogButton[];
};

/** Alert dialog: compact centred card, buttons side by side. */
export function Dialog({ open, onClose, title, message, buttons }: DialogProps) {
  const t = useTheme();
  const a = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (open) {
      a.setValue(0);
      Animated.spring(a, { toValue: 1, useNativeDriver: ND, damping: 20, stiffness: 320 }).start();
      if (buttons.some((b) => b.style === 'destructive')) haptic('warning');
    }
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  const press = (b: DialogButton) => {
    onClose();
    b.onPress?.();
  };
  const color = (b: DialogButton) => (b.style === 'destructive' ? t.c.danger : t.c.accent);
  const cancel = buttons.find((b) => b.style === 'cancel');

  return (
    <Modal transparent visible={open} animationType="fade" statusBarTranslucent onRequestClose={() => (cancel ? press(cancel) : onClose())}>
      <View style={{ flex: 1, backgroundColor: t.c.overlay, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <Animated.View
          accessibilityViewIsModal
          accessibilityRole="alert"
          style={{
            width: 270,
            maxWidth: 270,
            minWidth: undefined,
            borderRadius: t.look.r(14),
            backgroundColor: t.c.surface,
            ...(t.look.name === 'brutal' ? { borderWidth: 2, borderColor: t.c.ink } : null),
            overflow: 'hidden',
            opacity: a,
            transform: [{ scale: a.interpolate({ inputRange: [0, 1], outputRange: [1.1, 1] }) }],
          }}
        >
          <View style={{ padding: 16, paddingBottom: 16, gap: 4, alignItems: 'center' }}>
            <Text variant="headline" accessibilityRole="header" center>
              {title}
            </Text>
            {message ? (
              <Text variant="footnote" tone="ink" center>
                {message}
              </Text>
            ) : null}
          </View>
          {(
            <View style={{ flexDirection: buttons.length === 2 ? 'row' : 'column', borderTopWidth: 0.5, borderColor: t.c.rule }}>
              {buttons.map((b, i) => (
                <Pressable
                  key={b.label}
                  onPress={() => press(b)}
                  accessibilityRole="button"
                  style={({ pressed }) => ({
                    flex: buttons.length === 2 ? 1 : undefined,
                    height: 44,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: pressed ? t.c.fill : 'transparent',
                    borderLeftWidth: buttons.length === 2 && i ? 0.5 : 0,
                    borderTopWidth: buttons.length !== 2 && i ? 0.5 : 0,
                    borderColor: t.c.rule,
                  })}
                >
                  <Text weight={b.style === 'cancel' ? '600' : '400'} style={{ color: color(b) }}>
                    {b.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          )}
        </Animated.View>
      </View>
    </Modal>
  );
}
