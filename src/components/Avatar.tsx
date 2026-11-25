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
