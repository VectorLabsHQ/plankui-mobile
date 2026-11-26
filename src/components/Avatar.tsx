import { Image, View } from 'react-native';
import { useTheme } from '../theme';
import { Text } from './Text';

export type AvatarProps = { name: string; uri?: string; size?: number };

/** Photo, or initials on a tint picked from the name so each person keeps one colour. */
export function Avatar({ name, uri, size = 40 }: AvatarProps) {
  const t = useTheme();
  const initials = name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]!.toUpperCase()).join('');
  const hues = ['#1e64ef', '#0ca34c', '#d27d00', '#c2378a', '#7c4ddb', '#0f8f9e'];
  const hue = hues[[...name].reduce((s, ch) => s + ch.charCodeAt(0), 0) % hues.length]!;
  const box = { width: size, height: size, borderRadius: size / 2 };
  if (uri) return <Image source={{ uri }} style={box} accessibilityLabel={name} />;
  return (
    <View style={[box, { backgroundColor: t.wash(hue), alignItems: 'center', justifyContent: 'center' }]} accessibilityLabel={name} accessibilityRole="image">
      <Text style={{ fontSize: size * 0.4, fontWeight: '600', color: hue }} allowFontScaling={false}>
        {initials}
      </Text>
    </View>
  );
}

export type AvatarGroupProps = { names: string[]; max?: number; size?: number };

/** Overlapping avatars with a +N count for the rest, ringed in the surface colour so they stay apart. */
export function AvatarGroup({ names, max = 4, size = 32 }: AvatarGroupProps) {
  const t = useTheme();
  const shown = names.slice(0, max);
  const rest = names.length - shown.length;
  const ring = { borderWidth: 2, borderColor: t.c.surface, backgroundColor: t.c.surface, borderRadius: size / 2 + 2 }; // solid backing: avatar tints are see-through
  return (
    <View style={{ flexDirection: 'row' }} accessible accessibilityLabel={`${names.slice(0, 3).join(', ')}${names.length > 3 ? ` and ${names.length - 3} more` : ''}`}>
      {shown.map((n, i) => (
        <View key={n + i} style={[ring, { marginLeft: i ? -size / 4 : 0 }]} importantForAccessibility="no-hide-descendants">
          <Avatar name={n} size={size} />
        </View>
      ))}
      {rest > 0 ? (
        <View style={[ring, { marginLeft: -size / 4 }]}>
          <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: t.c.fill, borderWidth: 1, borderColor: t.c.rule, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontSize: size * 0.36, fontWeight: '500', color: t.c.ink2 }} allowFontScaling={false}>+{rest}</Text>
          </View>
        </View>
      ) : null}
    </View>
  );
}
