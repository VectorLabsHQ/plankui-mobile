import type { ReactNode } from 'react';
import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme';
import { haptic } from '../haptics';
import { Text } from './Text';

export type TabItem = {
  key: string;
  label: string;
  /** Draw the icon in the colour you are given. */
  icon: (p: { focused: boolean; color: string; size: number }) => ReactNode;
  badge?: number | boolean;
};

export type TabBarProps = { items: TabItem[]; value: string; onChange: (key: string) => void };

/** Bottom tabs. iOS: icons with small labels over a hairline. Android: Material 3 navigation bar with a pill. 3-5 items. */
export function TabBar({ items, value, onChange }: TabBarProps) {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const android = t.os === 'android';

  return (
    <View
      accessibilityRole="tablist"
      style={{
        flexDirection: 'row',
        paddingBottom: insets.bottom,
        backgroundColor: android ? t.c.surface : t.c.bg,
        borderTopWidth: android ? 0 : 0.5,
        borderColor: t.c.rule,
        elevation: android ? 3 : 0,
      }}
    >
      {items.map((it) => {
        const on = it.key === value;
        const color = android ? (on ? t.c.ink : t.c.ink2) : on ? t.c.accent : t.c.muted;
        return (
          <Pressable
            key={it.key}
            onPress={() => {
              if (!on) haptic('select');
              onChange(it.key);
            }}
            accessibilityRole="tab"
            accessibilityLabel={it.badge ? `${it.label}, ${typeof it.badge === 'number' ? `${it.badge} new` : 'new'}` : it.label}
            accessibilityState={{ selected: on }}
            style={{ flex: 1, alignItems: 'center', justifyContent: 'center', height: android ? 80 : 49, gap: android ? 4 : 2, paddingTop: android ? 12 : 6, paddingBottom: android ? 16 : 2 }}
          >
            <View
              style={{
                width: android ? 64 : 30,
                height: android ? 32 : 26,
                borderRadius: 16,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: android && on ? t.wash() : 'transparent',
              }}
            >
              {it.icon({ focused: on, color, size: android ? 24 : 25 })}
              {it.badge ? (
                <View
                  style={{
                    position: 'absolute',
                    top: android ? 2 : -2,
                    left: android ? 36 : 18,
                    minWidth: typeof it.badge === 'number' ? 16 : 8,
                    height: typeof it.badge === 'number' ? 16 : 8,
                    paddingHorizontal: typeof it.badge === 'number' ? 4 : 0,
                    borderRadius: 8,
                    backgroundColor: t.c.danger,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {typeof it.badge === 'number' ? (
                    <Text style={{ fontSize: 11, lineHeight: 14, color: '#fff', fontWeight: '600' }} allowFontScaling={false}>
                      {it.badge > 99 ? '99+' : it.badge}
                    </Text>
                  ) : null}
                </View>
              ) : null}
            </View>
            <Text
              style={{ fontSize: android ? 12 : 10, lineHeight: android ? 16 : 12, fontWeight: android ? (on ? '700' : '500') : '500', color }}
              numberOfLines={1}
              maxFontSizeMultiplier={1.3}
            >
              {it.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
