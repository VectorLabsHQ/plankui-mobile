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

/** Filter or input chip. Material 3 shape on Android (8 dp corners, check when selected); capsule on iOS. */
export function Chip({ label, selected, onPress, onRemove }: ChipProps) {
  const t = useTheme();
  const android = t.os === 'android';
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
        paddingLeft: selected && android ? 8 : 12,
        paddingRight: onRemove ? 8 : 12,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        overflow: 'hidden',
        borderRadius: t.look.r(android ? 8 : 16),
        borderWidth: brutal ? 2 : selected ? 0 : 1,
        borderColor: brutal ? t.c.ink : t.c.rule2,
        backgroundColor: selected ? t.wash() : t.look.name === 'glass' ? (t.look.card.backgroundColor as string) : 'transparent',
        opacity: pressed && !android ? 0.6 : 1,
      })}
    >
      {selected && android ? <Glyph name="check" color={t.c.ink} size={14} /> : null}
      <Text variant="subhead" weight="500" style={{ color: selected ? (android ? t.c.ink : t.c.accent) : t.c.ink2 }} numberOfLines={1}>
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
