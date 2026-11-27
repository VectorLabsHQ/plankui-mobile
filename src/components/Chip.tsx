import { Pressable, ScrollView, View } from 'react-native';
import { useTheme } from '../theme';
import { haptic } from '../haptics';
import { Glyph } from './Glyph';
import { Text } from './Text';

export type ChipProps = {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  /** Shows a close mark (input chips, e.g. chosen tags). */
  onRemove?: () => void;
};

/** Filter or input chip: a capsule, accent text when selected. */
export function Chip({ label, selected, onPress, onRemove }: ChipProps) {
  const t = useTheme();
  const ripple = t.os === 'android'; // ripple instead of a fade
  const brutal = t.look.name === 'brutal';
  return (
    <Pressable
      onPress={() => {
        haptic('select');
        (onPress ?? onRemove)?.();
      }}
      accessibilityRole={onPress ? 'checkbox' : 'button'}
      accessibilityState={onPress ? { checked: !!selected } : undefined}
      accessibilityLabel={onRemove && !onPress ? `Remove ${label}` : label}
      hitSlop={{ top: 6, bottom: 6 }}
      android_ripple={{ color: t.wash(t.c.ink) }}
      style={({ pressed }) => ({
        height: 32,
        paddingLeft: 12,
        paddingRight: onRemove ? 8 : 12,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        overflow: 'hidden',
        borderRadius: t.look.r(16),
        borderWidth: brutal ? 2 : selected ? 0 : 1,
        borderColor: brutal ? t.c.ink : t.c.rule2,
        backgroundColor: selected ? t.wash() : t.look.name === 'glass' ? (t.look.card.backgroundColor as string) : 'transparent',
        opacity: pressed && !ripple ? 0.6 : 1,
      })}
    >
      {null}
      <Text variant="subhead" weight="500" style={{ color: selected ? (t.c.accent) : t.c.ink2 }} numberOfLines={1}>
        {label}
      </Text>
      {onRemove ? <Glyph name="close" color={t.c.muted} size={11} /> : null}
    </Pressable>
  );
}

/** A row of chips that scrolls sideways, edge to edge. */
export function ChipRow({ children }: { children: React.ReactNode }) {
  return (
    <View style={{ marginHorizontal: -16 }}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}>
        {children}
      </ScrollView>
    </View>
  );
}
