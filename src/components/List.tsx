import { Children, Fragment, isValidElement, type ReactNode } from 'react';
import { Pressable, View } from 'react-native';
import { useTheme } from '../theme';
import { haptic } from '../haptics';
import { Glyph } from './Glyph';
import { Text } from './Text';

export type ListSectionProps = { title?: string; footer?: string; children: ReactNode };

/** iOS: inset grouped card with hairlines. Android: full-width rows under an accent label. */
/** Leading slot width on iOS, so titles line up whether a row has a 30 pt icon or an avatar. */
const LEAD = 32;

export function ListSection({ title, footer, children }: ListSectionProps) {
  const t = useTheme();
  const android = t.os === 'android';
  const rows = Children.toArray(children).filter(isValidElement);
  return (
    // Space after each section: iOS groups sit ~32 pt apart, Material lists ~24 dp (with the screen's 16 gap).
    <View style={{ marginHorizontal: android ? -16 : 0, marginBottom: android ? 8 : 16 }}>
      {title ? (
        <Text
          variant={android ? 'subhead' : 'footnote'}
          tone={android ? 'accent' : 'muted'}
          weight={android ? '500' : undefined}
          accessibilityRole="header"
          style={{ paddingHorizontal: 16, paddingBottom: android ? 4 : 6, textTransform: android ? 'none' : 'uppercase' }}
        >
          {title}
        </Text>
      ) : null}
      {/* outer view carries the look's shadow, inner one clips the rows to the corners */}
      <View style={android ? null : [t.look.card, { borderRadius: t.look.r(12) }]}>
        <View style={android ? null : { borderRadius: t.look.r(12) - Number(t.look.card.borderWidth ?? 0), overflow: 'hidden' }}>
        {rows.map((row, i) => (
          <Fragment key={row.key ?? i}>
            {row}
            {/* iOS insets the hairline to where the row's text starts, past any icon */}
            {i < rows.length - 1 && !android ? <View style={{ height: 0.5, marginLeft: (row.props as { left?: unknown }).left ? 16 + LEAD + 12 : 16, backgroundColor: t.c.rule }} /> : null}
          </Fragment>
        ))}
        </View>
      </View>
      {footer ? (
        <Text variant="footnote" tone="muted" style={{ paddingHorizontal: 16, paddingTop: 6 }}>
          {footer}
        </Text>
      ) : null}
    </View>
  );
}

export type ListItemProps = {
  title: string;
  subtitle?: string;
  /** Icon or avatar on the leading edge. */
  left?: ReactNode;
  /** Value text or a control (e.g. <Switch>) on the trailing edge. */
  right?: ReactNode;
  value?: string;
  onPress?: () => void;
  /** iOS shows a chevron on rows that open another screen. Default: on when onPress is set. */
  chevron?: boolean;
  destructive?: boolean;
  /** Puts a check on the row (single-choice lists). */
  selected?: boolean;
};

export function ListItem({ title, subtitle, left, right, value, onPress, chevron, destructive, selected }: ListItemProps) {
  const t = useTheme();
  const android = t.os === 'android';
  const showChevron = !android && (chevron ?? (!!onPress && selected === undefined && !destructive));
  const body = (
    <>
      {left ? <View style={{ minWidth: android ? 40 : LEAD, alignItems: 'center' }}>{left}</View> : null}
      <View style={{ flex: 1, gap: 2 }}>
        <Text variant="body" style={destructive ? { color: t.c.danger } : null} numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? (
          <Text variant={android ? 'subhead' : 'subhead'} tone="muted" numberOfLines={2}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {value ? <Text tone="muted" numberOfLines={1}>{value}</Text> : null}
      {right}
      {selected ? <Glyph name="check" color={t.c.accent} size={18} /> : null}
      {showChevron ? <Glyph name="chevron-right" color={t.c.muted} size={14} /> : null}
    </>
  );
  const row = {
    minHeight: subtitle ? (android ? 72 : 60) : android ? 56 : 44,
    paddingHorizontal: 16,
    paddingVertical: android ? 8 : 10,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: android ? 16 : 12,
  };
  if (!onPress) return <View style={row}>{body}</View>;
  return (
    <Pressable
      onPress={() => {
        haptic('select');
        onPress();
      }}
      accessibilityRole="button"
      accessibilityLabel={[title, subtitle, value].filter(Boolean).join(', ')}
      accessibilityState={selected !== undefined ? { selected } : undefined}
      android_ripple={{ color: t.wash(t.c.ink) }}
      style={({ pressed }) => [row, pressed && !android && { backgroundColor: t.c.fill }]}
    >
      {body}
    </Pressable>
  );
}
