'use no memo'; // Animated values are mutated outside render; React Compiler memoisation freezes them.
import { createContext, useContext, useRef, type ReactNode } from 'react';
import { Animated, Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme';
import { haptic } from '../haptics';
import { Glyph, type GlyphName } from './Glyph';
import { Text } from './Text';

/**
 * standard    inline title in the bar
 * center      title centred in the bar
 * large       large title; the big title scrolls into the bar
 * medium      smaller big title that scrolls into the bar
 * search      large title with a search field under it
 * transparent floats over a cover image; buttons sit on round chips, the bar fills in as you scroll
 * modal       for sheets and full-screen forms: Cancel / Done
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
  const clear = variant === 'transparent';
  const big = hasBigTitle(variant);
  const bg = grouped ? t.c.grouped : t.c.bg;

  // When the bar's own title shows: always, or once the big title / cover has scrolled under the bar.
  const titleIn = big ? y.interpolate({ inputRange: [28, 44], outputRange: [0, 1], extrapolate: 'clamp' })
    : clear ? y.interpolate({ inputRange: [140, 180], outputRange: [0, 1], extrapolate: 'clamp' })
    : 1;
  // A hairline once content is under the bar.
  const scrolled = y.interpolate({ inputRange: big ? [40, 52] : clear ? [150, 190] : [0, 8], outputRange: [0, 1], extrapolate: 'clamp' });

  const centred = true;
  const top = variant === 'modal' ? 0 : insets.top; // iOS modals are page sheets: no status bar inset

  const back = onBack ? (
    <NavBarButton
      icon={'chevron-left'}
      label={!clear ? backLabel : undefined}
      accessibilityLabel={backLabel}
      onPress={onBack}
      back
    />
  ) : null;

  const titleBlock = (
    <Animated.View style={{ opacity: titleIn, alignItems: centred ? 'center' : 'flex-start', flexShrink: 1 }}>
      <Text variant="headline" numberOfLines={1} accessibilityRole="header">
        {title}
      </Text>
      {subtitle && !big ? (
        <Text variant="caption" tone="muted" numberOfLines={1}>
          {subtitle}
        </Text>
      ) : null}
    </Animated.View>
  );

  const height = 44;

  return (
    <Transparent.Provider value={clear ? scrolled : null}>
      <View style={{ paddingTop: top, zIndex: 10 }}>
        {/* ground: solid, or fading in over a cover */}
        <Animated.View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: bg, opacity: clear ? scrolled : 1 }} />
        {null}
        <View style={{ height, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8 }}>
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
        {<Animated.View style={{ height: 0.5, backgroundColor: t.c.rule, opacity: accessory ? 1 : scrolled }} />}
      </View>
    </Transparent.Provider>
  );
}

/** Drawn by <Screen> as the first thing in the scroll view for large, medium and search bars. */
export function BigTitle({ title, subtitle, variant }: { title: string; subtitle?: string; variant?: NavBarVariant }) {
  return (
    <View style={{ paddingTop: 0, gap: 2 }}>
      <Text variant="largeTitle" accessibilityRole="header">
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
  /** Bold, for the confirming action (Done). */
  prominent?: boolean;
  disabled?: boolean;
  accessibilityLabel?: string;
  back?: boolean;
};

/** Text or icon button for a <NavBar>, with a 44 pt / 48 dp target. */
export function NavBarButton({ icon, label, onPress, prominent, disabled, accessibilityLabel, back }: NavBarButtonProps) {
  const t = useTheme();
  const chip = useContext(Transparent);
  const color = t.c.accent;
  const draw = (c: string) => (typeof icon === 'function' ? icon(c) : icon ? <Glyph name={icon} color={c} size={20} /> : null);
  const iconNode = draw(color);
  const onlyIcon = !!icon && !label;

  

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
        paddingHorizontal: onlyIcon ? 0 : 8,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: back && !chip ? 'flex-start' : 'center',
        gap: 2,
        opacity: disabled ? 0.35 : pressed && t.os !== 'android' ? 0.5 : 1,
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
          variant="body"
          weight={prominent ? '600' : '400'}
          style={{ color: t.c.accent }}
          numberOfLines={1}
        >
          {label}
        </Text>
      ) : null}
    </Pressable>
  );
}
