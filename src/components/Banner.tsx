import type { ReactNode } from 'react';
import { Pressable, View } from 'react-native';
import { useTheme, withAlpha } from '../theme';
import { Button } from './Button';
import { Glyph } from './Glyph';
import { Text } from './Text';

export type BannerProps = {
  title: string;
  message?: string;
  tone?: 'info' | 'success' | 'warning' | 'danger';
  action?: { label: string; onPress: () => void };
  onDismiss?: () => void;
};

/** Inline message that stays until dealt with (unlike a toast). */
export function Banner({ title, message, tone = 'info', action, onDismiss }: BannerProps) {
  const t = useTheme();
  const color = tone === 'info' ? t.c.accent : t.c[tone];
  const brutal = t.look.name === 'brutal';
  return (
    <View
      accessibilityRole={tone === 'danger' || tone === 'warning' ? 'alert' : 'summary'}
      style={{
        flexDirection: 'row',
        gap: 12,
        padding: 14,
        borderRadius: t.look.r(14),
        backgroundColor: withAlpha(color, t.scheme === 'dark' ? 0.18 : 0.1),
        borderWidth: brutal ? 2 : t.look.name === 'flat' ? 1 : 0,
        borderColor: brutal ? t.c.ink : withAlpha(color, 0.35),
        ...(brutal ? { boxShadow: `3px 3px 0 0 ${t.c.ink}` } : null),
      }}
    >
      <View style={{ width: 4, borderRadius: 2, backgroundColor: color }} />
      <View style={{ flex: 1, gap: 4 }}>
        <Text variant="headline">{title}</Text>
        {message ? <Text variant="subhead" tone="ink2">{message}</Text> : null}
        {action ? (
          <View style={{ marginTop: 6 }}>
            <Button size="sm" variant="tinted" tone={tone === 'danger' ? 'danger' : 'accent'} onPress={action.onPress}>
              {action.label}
            </Button>
          </View>
        ) : null}
      </View>
      {onDismiss ? (
        <Pressable onPress={onDismiss} accessibilityRole="button" accessibilityLabel="Dismiss" hitSlop={12} style={{ paddingTop: 2 }}>
          <Glyph name="close" color={t.c.muted} size={12} />
        </Pressable>
      ) : null}
    </View>
  );
}

export type EmptyStateProps = { icon?: ReactNode; title: string; message?: string; action?: { label: string; onPress: () => void } };

/** What a screen shows when there is nothing yet: what it is for and the one step to fill it. */
export function EmptyState({ icon, title, message, action }: EmptyStateProps) {
  const t = useTheme();
  return (
    <View style={{ alignItems: 'center', paddingVertical: 40, paddingHorizontal: 24, gap: 8 }}>
      {icon ? (
        <View style={{ width: 64, height: 64, borderRadius: t.look.r(20), backgroundColor: t.wash(), alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}>{icon}</View>
      ) : null}
      <Text variant="title2" center>
        {title}
      </Text>
      {message ? (
        <Text tone="muted" center style={{ maxWidth: 300 }}>
          {message}
        </Text>
      ) : null}
      {action ? (
        <View style={{ marginTop: 12 }}>
          <Button onPress={action.onPress}>{action.label}</Button>
        </View>
      ) : null}
    </View>
  );
}

/** Hairline between groups of content. */
export function Divider({ inset = 0, vertical }: { inset?: number; vertical?: boolean }) {
  const t = useTheme();
  const w = t.look.name === 'brutal' ? 2 : t.os === 'android' ? 1 : 0.5;
  const color = t.look.name === 'brutal' ? t.c.ink : t.c.rule;
  return vertical ? <View style={{ width: w, alignSelf: 'stretch', backgroundColor: color }} /> : <View style={{ height: w, marginLeft: inset, backgroundColor: color }} />;
}
