import type { ReactNode } from 'react';
import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme, withAlpha } from '../theme';
import { haptic } from '../haptics';
import { Text } from './Text';

export type TabItem = {
  key: string;
  label: string;
  /** Draw the icon in the colour you are given. */
  icon: (p: { focused: boolean; color: string; size: number }) => ReactNode;
  badge?: number | boolean;
};

export type TabBarAction = { label: string; icon: (p: { color: string; size: number }) => ReactNode; onPress: () => void };

export type TabBarProps = {
  items: TabItem[];
  value: string;
  onChange: (key: string) => void;
  /**
   * Floats the bar over the content: an iOS 26 glass capsule, or a Material 3 Expressive
   * floating toolbar on Android. Pass it as Screen's footer; Screen lets content scroll under it.
   */
  floating?: boolean;
  /** Floating only: a round button beside the bar (iOS search tab, Android FAB). */
  action?: TabBarAction;
};

/** Bottom tabs. iOS: icons with small labels over a hairline. Android: Material 3 navigation bar with a pill. 3-5 items. */
export function TabBar({ items, value, onChange, floating, action }: TabBarProps) {
  const t = useTheme();
  if (floating) return <FloatingTabBar items={items} value={value} onChange={onChange} action={action} />;
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

function Dot({ badge, top, left }: { badge: TabItem['badge']; top: number; left: number }) {
  const t = useTheme();
  if (!badge) return null;
  const n = typeof badge === 'number';
  return (
    <View style={{ position: 'absolute', top, left, minWidth: n ? 16 : 8, height: n ? 16 : 8, paddingHorizontal: n ? 4 : 0, borderRadius: 8, backgroundColor: t.c.danger, alignItems: 'center', justifyContent: 'center' }}>
      {n ? (
        <Text style={{ fontSize: 11, lineHeight: 14, color: '#fff', fontWeight: '600' }} allowFontScaling={false}>
          {(badge as number) > 99 ? '99+' : badge}
        </Text>
      ) : null}
    </View>
  );
}

/**
 * iOS: a capsule with icon-over-label tabs and a soft pill behind the chosen one, plus an optional round
 * search-style button. Android: a pill toolbar where the chosen tab shows icon and label side by side, with a FAB.
 * Both use PlankUI's card border and shadow so they sit with the web components. // taste-skill-ignore: the floating bar is a sticky overlay
 */
function FloatingTabBar({ items, value, onChange, action }: Omit<TabBarProps, 'floating'>) {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const android = t.os === 'android';
  const dark = t.scheme === 'dark';
  const H = android ? 64 : 62;
  const shell = {
    height: H,
    borderRadius: H / 2,
    borderWidth: t.look.name === 'brutal' ? 2 : 1,
    borderColor: t.look.name === 'brutal' ? t.c.ink : t.c.rule2,
    backgroundColor: android ? t.c.surface : withAlpha(t.c.surface, dark ? 0.72 : 0.78),
    boxShadow: `0 10px 30px -10px rgba(0,0,0,${dark ? 0.6 : 0.22})`,
    // web: real glass behind the capsule (native shows the translucent fill)
    ...(android ? null : ({ backdropFilter: 'blur(20px) saturate(180%)', WebkitBackdropFilter: 'blur(20px) saturate(180%)' } as object)),
  };
  return (
    <View pointerEvents="box-none" style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: android ? 12 : 10, paddingHorizontal: 16, paddingBottom: Math.max(insets.bottom, 16) }}>
      <View accessibilityRole="tablist" style={[shell, android ? { flexShrink: 1 } : { flex: 1 }, { flexDirection: 'row', alignItems: 'center', padding: 4, gap: android ? 4 : 0 }]}>
        {items.map((it) => {
          const on = it.key === value;
          const color = on ? (android ? t.c.ink : t.c.accent) : android ? t.c.ink2 : t.c.ink;
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
              style={({ pressed }) => ({
                ...(android ? null : { flex: 1 }),
                height: H - 10,
                minWidth: android ? 56 : undefined,
                paddingHorizontal: android ? 16 : 0,
                borderRadius: (H - 10) / 2,
                flexDirection: android ? 'row' : 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: android ? 8 : 1,
                backgroundColor: on ? (android ? t.wash() : t.c.fill) : pressed ? t.wash(t.c.ink) : 'transparent',
              })}
            >
              <View>
                {it.icon({ focused: on, color, size: android ? 24 : 24 })}
                <Dot badge={it.badge} top={-3} left={android ? 16 : 15} />
              </View>
              {!android || on ? (
                <Text style={{ fontSize: android ? 14 : 10, lineHeight: android ? 20 : 12, fontWeight: android ? '600' : on ? '600' : '500', color }} numberOfLines={1} maxFontSizeMultiplier={1.3}>
                  {it.label}
                </Text>
              ) : null}
            </Pressable>
          );
        })}
      </View>
      {action ? (
        <Pressable
          onPress={() => {
            haptic('tap');
            action.onPress();
          }}
          accessibilityRole="button"
          accessibilityLabel={action.label}
          style={({ pressed }) => [
            shell,
            { width: H, alignItems: 'center', justifyContent: 'center', transform: [{ scale: pressed ? 0.94 : 1 }] },
            android ? { borderRadius: t.look.r(16), borderWidth: 0, backgroundColor: t.c.accent } : null,
          ]}
        >
          {action.icon({ color: android ? t.c.onAccent : t.c.ink, size: 24 })}
        </Pressable>
      ) : null}
    </View>
  );
}
