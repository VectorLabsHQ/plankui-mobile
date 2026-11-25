'use no memo'; // Animated values are mutated outside render; React Compiler memoisation freezes them.
import { createContext, useContext, useRef, type ReactNode } from 'react';
import { Animated, Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme, withAlpha } from '../theme';
import { haptic } from '../haptics';
import { Glyph, type GlyphName } from './Glyph';
import { Text } from './Text';

/**
 * standard    iOS inline title / Material small top app bar (title on the left)
 * center      title centred on both platforms (Material center-aligned top app bar)
 * large       iOS large title / Material large top app bar; the big title scrolls into the bar
 * medium      smaller big title (Material medium top app bar; iOS large)
 * search      large title with a search field under it
 * transparent floats over a cover image; buttons sit on round chips, the bar fills in as you scroll
 * modal       for sheets and full-screen forms: Cancel / Done (iOS), close + Save (Android)
 */
export type NavBarVariant = 'standard' | 'center' | 'large' | 'medium' | 'search' | 'transparent' | 'modal';

export type NavBarProps = {
  title: string;
  subtitle?: string;
  variant?: NavBarVariant;
  onBack?: () => void;
  /** iOS shows the previous screen's name next to the chevron. */
  backLabel?: string;
  /** Leading buttons (after the back button). Use <NavBarButton>. */
  left?: ReactNode;
  /** Trailing buttons. Use <NavBarButton>; keep it to 1-3. */
  right?: ReactNode;
  /** Pinned under the bar, e.g. a <SegmentedControl>. */
  accessory?: ReactNode;
  /** For variant="search". Rendered by <Screen> under the large title. */
  search?: { value: string; onChangeText: (v: string) => void; placeholder?: string };
  /** Matches <Screen grouped>. */
  grouped?: boolean;
};

/** Scroll position shared by <Screen> so the bar can react to it. */
export const ScrollY = createContext<Animated.Value | null>(null);
/** Set inside a transparent bar: how far it has filled in (0 over the cover, 1 solid). */
const Transparent = createContext<Animated.AnimatedInterpolation<number> | null>(null);

/** Variants whose big title lives in the scroll content (drawn by <Screen>). */
export const hasBigTitle = (v?: NavBarVariant) => v === 'large' || v === 'medium' || v === 'search';

export function NavBar({ title, subtitle, variant = 'standard', onBack, backLabel = 'Back', left, right, accessory, grouped }: NavBarProps) {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const fallback = useRef(new Animated.Value(0)).current;
  const y = useContext(ScrollY) ?? fallback;
  const android = t.os === 'android';
  const clear = variant === 'transparent';
  const big = hasBigTitle(variant);
  const bg = grouped && !android ? t.c.grouped : t.c.bg;

  // When the bar's own title shows: always, or once the big title / cover has scrolled under the bar.
  const titleIn = big ? y.interpolate({ inputRange: [28, 44], outputRange: [0, 1], extrapolate: 'clamp' })
    : clear ? y.interpolate({ inputRange: [140, 180], outputRange: [0, 1], extrapolate: 'clamp' })
    : 1;
  // iOS: hairline once content is under the bar. Android: surface tint once content is under the bar.
  const scrolled = y.interpolate({ inputRange: big ? [40, 52] : clear ? [150, 190] : [0, 8], outputRange: [0, 1], extrapolate: 'clamp' });

  const centred = !android || variant === 'center';
  const top = variant === 'modal' && !android ? 0 : insets.top; // iOS modals are page sheets: no status bar inset

  const back = onBack ? (
    <NavBarButton
      icon={android ? 'arrow-left' : 'chevron-left'}
      label={!android && !clear ? backLabel : undefined}
      accessibilityLabel={android ? 'Navigate up' : backLabel}
      onPress={onBack}
      back
    />
  ) : null;

  const titleBlock = (
    <Animated.View style={{ opacity: titleIn, alignItems: centred ? 'center' : 'flex-start', flexShrink: 1 }}>
      <Text variant={android && !centred ? 'title2' : 'headline'} numberOfLines={1} accessibilityRole="header">
        {title}
      </Text>
      {subtitle && !big ? (
        <Text variant="caption" tone="muted" numberOfLines={1}>
          {subtitle}
        </Text>
      ) : null}
    </Animated.View>
  );

  const height = android ? 64 : 44;

  return (
    <Transparent.Provider value={clear ? scrolled : null}>
      <View style={{ paddingTop: top, zIndex: 10 }}>
        {/* ground: solid, or fading in over a cover */}
        <Animated.View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: bg, opacity: clear ? scrolled : 1 }} />
        {android ? <Animated.View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: withAlpha(t.c.accent, 0.08), opacity: scrolled }} /> : null}
        <View style={{ height, flexDirection: 'row', alignItems: 'center', paddingHorizontal: android ? 4 : 8 }}>
          {centred ? (
            <>
              <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
                {back}
                {left}
              </View>
              {titleBlock}
              <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end' }}>{right}</View>
            </>
          ) : (
            <>
              {back}
              {left}
              <View style={{ flex: 1, paddingLeft: back || left ? 4 : 12 }}>{titleBlock}</View>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>{right}</View>
            </>
          )}
        </View>
        {accessory ? <View style={{ paddingHorizontal: 16, paddingBottom: 8 }}>{accessory}</View> : null}
        {!android ? <Animated.View style={{ height: 0.5, backgroundColor: t.c.rule, opacity: accessory ? 1 : scrolled }} /> : null}
      </View>
    </Transparent.Provider>
  );
}

/** Drawn by <Screen> as the first thing in the scroll view for large, medium and search bars. */
export function BigTitle({ title, subtitle, variant }: { title: string; subtitle?: string; variant?: NavBarVariant }) {
  const t = useTheme();
  const android = t.os === 'android';
  return (
    <View style={{ paddingTop: android ? (variant === 'medium' ? 4 : 28) : 0, gap: 2 }}>
      <Text variant={android && variant === 'medium' ? 'title' : 'largeTitle'} accessibilityRole="header">
        {title}
      </Text>
      {subtitle ? <Text variant="subhead" tone="muted">{subtitle}</Text> : null}
    </View>
  );
}

export type NavBarButtonProps = {
  /** A built-in glyph or your own icon drawn in the colour given. */
  icon?: GlyphName | ((color: string) => ReactNode);
  label?: string;
  onPress: () => void;
  /** Bold (iOS Done) or filled (Material Save). */
  prominent?: boolean;
  disabled?: boolean;
  accessibilityLabel?: string;
  back?: boolean;
};

/** Text or icon button for a <NavBar>, with a 44 pt / 48 dp target. */
export function NavBarButton({ icon, label, onPress, prominent, disabled, accessibilityLabel, back }: NavBarButtonProps) {
  const t = useTheme();
  const android = t.os === 'android';
  const chip = useContext(Transparent);
  const color = android ? (label && !icon ? t.c.accent : t.c.ink) : t.c.accent;
  const draw = (c: string) => (typeof icon === 'function' ? icon(c) : icon ? <Glyph name={icon} color={c} size={android ? 22 : 20} /> : null);
  const iconNode = draw(color);
  const onlyIcon = !!icon && !label;

  if (android && label && !icon && prominent) {
    return (
      <Pressable
        onPress={onPress}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityState={{ disabled: !!disabled }}
        android_ripple={{ color: 'rgba(255,255,255,0.24)' }}
        style={{ height: 40, paddingHorizontal: 20, marginHorizontal: 4, borderRadius: 20, backgroundColor: t.c.accent, justifyContent: 'center', overflow: 'hidden', opacity: disabled ? 0.4 : 1 }}
      >
        <Text variant="subhead" weight="500" tone="onAccent">
          {label}
        </Text>
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={() => {
        if (!back) haptic('tap');
        onPress();
      }}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled: !!disabled }}
      hitSlop={4}
      android_ripple={{ color: t.wash(t.c.ink), borderless: true, radius: 22 }}
      style={({ pressed }) => ({
        minWidth: t.hit,
        height: t.hit,
        paddingHorizontal: onlyIcon ? 0 : android ? 12 : 8,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: back && !android && !chip ? 'flex-start' : 'center',
        gap: 2,
        opacity: disabled ? 0.35 : pressed && !android ? 0.5 : 1,
      })}
    >
      {chip && iconNode ? (
        // Over the cover: white icon on a dark chip. As the bar fills in, it crossfades to the normal icon.
        <View style={{ width: 34, height: 34, alignItems: 'center', justifyContent: 'center' }}>
          <Animated.View style={{ position: 'absolute', width: 34, height: 34, borderRadius: 17, backgroundColor: 'rgba(0,0,0,0.38)', alignItems: 'center', justifyContent: 'center', opacity: Animated.subtract(1, chip) }}>
            {draw('#ffffff')}
          </Animated.View>
          <Animated.View style={{ opacity: chip }}>{iconNode}</Animated.View>
        </View>
      ) : (
        iconNode
      )}
      {label ? (
        <Text
          variant={android ? 'subhead' : 'body'}
          weight={prominent ? '600' : android ? '500' : '400'}
          style={{ color: t.c.accent }}
          numberOfLines={1}
        >
          {label}
        </Text>
      ) : null}
    </Pressable>
  );
}
