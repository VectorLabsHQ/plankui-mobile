// Tiny icons drawn with Views, so the library needs no icon font or SVG package.
import { View } from 'react-native';

export type GlyphName = 'chevron-right' | 'chevron-left' | 'arrow-left' | 'check' | 'close' | 'search' | 'more' | 'plus';
type Props = { name: GlyphName; color: string; size?: number };

export function Glyph({ name, color, size = 14 }: Props) {
  const stroke = Math.max(2, Math.round(size / 7));
  const box = { width: size, height: size, alignItems: 'center' as const, justifyContent: 'center' as const };
  if (name === 'chevron-right' || name === 'chevron-left') {
    const s = size * 0.55;
    return (
      <View style={box} importantForAccessibility="no" accessibilityElementsHidden>
        <View
          style={{
            width: s,
            height: s,
            borderColor: color,
            borderTopWidth: stroke,
            borderRightWidth: stroke,
            borderRadius: 1,
            transform: [{ translateX: name === 'chevron-right' ? -s * 0.2 : s * 0.2 }, { rotate: name === 'chevron-right' ? '45deg' : '-135deg' }],
          }}
        />
      </View>
    );
  }
  if (name === 'arrow-left') {
    const s = size * 0.45;
    return (
      <View style={box} importantForAccessibility="no" accessibilityElementsHidden>
        <View style={{ position: 'absolute', width: size * 0.8, height: stroke, backgroundColor: color, borderRadius: 1 }} />
        <View
          style={{
            position: 'absolute',
            left: size * 0.12,
            width: s,
            height: s,
            borderColor: color,
            borderLeftWidth: stroke,
            borderBottomWidth: stroke,
            transform: [{ rotate: '45deg' }],
          }}
        />
      </View>
    );
  }
  if (name === 'check') {
    return (
      <View style={box} importantForAccessibility="no" accessibilityElementsHidden>
        <View
          style={{
            width: size * 0.35,
            height: size * 0.65,
            borderColor: color,
            borderRightWidth: stroke,
            borderBottomWidth: stroke,
            transform: [{ translateY: -size * 0.08 }, { rotate: '45deg' }],
          }}
        />
      </View>
    );
  }
  if (name === 'search') {
    const r = size * 0.62;
    return (
      <View style={box} importantForAccessibility="no" accessibilityElementsHidden>
        <View style={{ position: 'absolute', top: size * 0.06, left: size * 0.06, width: r, height: r, borderRadius: r / 2, borderWidth: stroke, borderColor: color }} />
        <View style={{ position: 'absolute', right: size * 0.04, bottom: size * 0.18, width: size * 0.36, height: stroke, borderRadius: 1, backgroundColor: color, transform: [{ rotate: '45deg' }] }} />
      </View>
    );
  }
  if (name === 'more') {
    const d = Math.max(3, size * 0.2);
    return (
      <View style={[box, { flexDirection: 'row', gap: d * 0.6 }]} importantForAccessibility="no" accessibilityElementsHidden>
        {[0, 1, 2].map((i) => (
          <View key={i} style={{ width: d, height: d, borderRadius: d / 2, backgroundColor: color }} />
        ))}
      </View>
    );
  }
  return (
    <View style={box} importantForAccessibility="no" accessibilityElementsHidden>
      {(name === 'plus' ? [0, 90] : [45, -45]).map((r) => (
        <View key={r} style={{ position: 'absolute', width: size * 0.9, height: stroke, backgroundColor: color, borderRadius: 1, transform: [{ rotate: `${r}deg` }] }} />
      ))}
    </View>
  );
}
