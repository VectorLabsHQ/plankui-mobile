// PlankUI Mobile theme: PlankUI's themes, accents and component styles ("looks") in hex
// (React Native has no oklch), one hook for colours, platform and type, and a provider.
import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { Platform, useColorScheme, type TextStyle, type ViewStyle } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ACCENTS, STATUS, THEMES } from './palettes';

export const PUBLISHER = 'Vector Labs';

export type OS = 'ios' | 'android';
export type Scheme = 'light' | 'dark';
/** PlankUI themes: Volt (white, blue), Ember (warm, orange), Grove (olive, sage), Nebula (navy, violet), Terminal (mono, green), Candy (blush, rose). */
export type ThemeName = keyof typeof THEMES;
/** PlankUI accent presets, or any hex colour. mono uses the ink colour. */
export type AccentName = keyof typeof ACCENTS | 'mono';
/** PlankUI component styles. */
export type LookName = 'soft' | 'flat' | 'glass' | 'keycap' | 'brutal';

export const THEME_NAMES = Object.keys(THEMES) as ThemeName[];
export const ACCENT_NAMES = [...Object.keys(ACCENTS), 'mono'] as AccentName[];
export const LOOK_NAMES: LookName[] = ['soft', 'flat', 'glass', 'keycap', 'brutal'];

export type Colors = {
  bg: string;
  grouped: string; // screen behind inset lists (iOS grouped background)
  surface: string; // cards, sheets, list groups
  fill: string; // tracks of switches and segmented controls
  field: string;
  ink: string;
  ink2: string;
  muted: string;
  rule: string;
  rule2: string;
  edge: string; // field outlines
  accent: string;
  accentEdge: string; // darker accent for keycap edges
  onAccent: string;
  danger: string;
  success: string;
  warning: string;
  overlay: string;
  inverse: string; // snackbar ground
  onInverse: string;
};

type TypeScale = Record<'largeTitle' | 'title' | 'title2' | 'headline' | 'body' | 'callout' | 'subhead' | 'footnote' | 'caption', TextStyle>;

const iosType: TypeScale = {
  largeTitle: { fontSize: 34, lineHeight: 41, fontWeight: '700' },
  title: { fontSize: 28, lineHeight: 34, fontWeight: '700' },
  title2: { fontSize: 22, lineHeight: 28, fontWeight: '600' },
  headline: { fontSize: 17, lineHeight: 22, fontWeight: '600' },
  body: { fontSize: 17, lineHeight: 22, fontWeight: '400' },
  callout: { fontSize: 16, lineHeight: 21, fontWeight: '400' },
  subhead: { fontSize: 15, lineHeight: 20, fontWeight: '400' },
  footnote: { fontSize: 13, lineHeight: 18, fontWeight: '400' },
  caption: { fontSize: 12, lineHeight: 16, fontWeight: '400' },
};

const androidType: TypeScale = {
  largeTitle: { fontSize: 32, lineHeight: 40, fontWeight: '400' },
  title: { fontSize: 24, lineHeight: 32, fontWeight: '400' },
  title2: { fontSize: 22, lineHeight: 28, fontWeight: '400' },
  headline: { fontSize: 16, lineHeight: 24, fontWeight: '500' },
  body: { fontSize: 16, lineHeight: 24, fontWeight: '400' },
  callout: { fontSize: 15, lineHeight: 22, fontWeight: '400' },
  subhead: { fontSize: 14, lineHeight: 20, fontWeight: '400' },
  footnote: { fontSize: 12, lineHeight: 16, fontWeight: '400' },
  caption: { fontSize: 11, lineHeight: 16, fontWeight: '500' },
};

export type TypeVariant = keyof TypeScale;

export type Look = {
  name: LookName;
  /** Scales a corner radius by the theme's radius setting and the look. */
  r: (n: number) => number;
  /** Cards, list groups, toasts. */
  card: ViewStyle;
  /** Text fields on iOS (Android keeps the Material outline, recoloured). */
  field: ViewStyle;
  /** Extra style for a filled button of this colour. */
  button: (fill: string, edge: string, pressed: boolean) => ViewStyle;
  /** Segmented control thumb. */
  thumb: ViewStyle;
};

export type Theme = {
  os: OS;
  scheme: Scheme;
  theme: ThemeName;
  c: Colors;
  look: Look;
  type: TypeScale;
  /** Font families, when the theme or the app sets them. */
  font: { body?: string; display?: string };
  /** Smallest touch target: 44 pt (Apple HIG), 48 dp (Material). */
  hit: number;
  /** Translucent accent for tinted buttons, selections and pills. */
  wash: (color?: string) => string;
};

const Ctx = createContext<Theme | null>(null);

export type PlankProviderProps = {
  children: ReactNode;
  /** Force a platform look. Default: the device's own (web gets iOS). */
  platform?: OS;
  /** Force light or dark. Default: the system setting. */
  scheme?: Scheme;
  /** PlankUI theme. Default volt. */
  theme?: ThemeName;
  /** Accent preset or any hex colour. Default: the theme's own. */
  accent?: AccentName | (string & {});
  /** PlankUI component style. Default soft. */
  look?: LookName;
  /** Corner radius multiplier, 0 (square) to 2. Default 1. */
  radius?: number;
  /** Font families you have loaded (expo-font). Terminal uses the system monospace by default. */
  fonts?: { body?: string; display?: string };
};

const MONO = Platform.select({ ios: 'Menlo', android: 'monospace', default: 'ui-monospace, Menlo, monospace' });

export function PlankProvider({ children, platform, scheme, theme = 'volt', accent, look = 'soft', radius = 1, fonts }: PlankProviderProps) {
  const system = useColorScheme();
  const os: OS = platform ?? (Platform.OS === 'android' ? 'android' : 'ios');
  const sc: Scheme = scheme ?? (system === 'dark' ? 'dark' : 'light');
  const value = useMemo<Theme>(() => {
    const th = THEMES[theme] ?? THEMES.volt;
    const p = th[sc];
    const preset = accent && accent in ACCENTS ? ACCENTS[accent as keyof typeof ACCENTS][sc] : null;
    const a =
      accent === 'mono' ? { accent: p.ink, edge: p.ink, onAccent: p.bg }
      : preset ?? (accent && accent.startsWith('#') ? { accent, edge: shade(accent, -0.25), onAccent: '#ffffff' } : th.accent[sc]);
    const c: Colors = {
      ...p,
      accent: a.accent,
      accentEdge: a.edge,
      onAccent: a.onAccent,
      ...STATUS[sc],
      overlay: sc === 'dark' ? 'rgba(0,0,0,0.7)' : 'rgba(0,0,0,0.4)',
    };
    if (look === 'glass') {
      // Glass needs colour behind it: tint the ground with the accent, and let surfaces show it through.
      c.grouped = mix(c.grouped, c.accent, sc === 'dark' ? 0.16 : 0.1);
      c.bg = mix(c.bg, c.accent, sc === 'dark' ? 0.1 : 0.05);
    }
    return {
      os,
      scheme: sc,
      theme,
      c,
      look: makeLook(look, c, sc, radius),
      type: os === 'android' ? androidType : iosType,
      font: { body: fonts?.body ?? (theme === 'terminal' ? MONO : undefined), display: fonts?.display ?? fonts?.body ?? (theme === 'terminal' ? MONO : undefined) },
      hit: os === 'android' ? 48 : 44,
      wash: (color = c.accent) => withAlpha(color, sc === 'dark' ? 0.24 : 0.12),
    };
  }, [os, sc, theme, accent, look, radius, fonts?.body, fonts?.display]);
  return (
    <SafeAreaProvider>
      <Ctx.Provider value={value}>{children}</Ctx.Provider>
    </SafeAreaProvider>
  );
}

function makeLook(name: LookName, c: Colors, sc: Scheme, radius: number): Look {
  const k = name === 'brutal' ? radius * 0.5 : radius;
  const r = (n: number) => Math.round(n * k);
  const dark = sc === 'dark';
  switch (name) {
    case 'flat':
      return {
        name, r,
        card: { backgroundColor: c.surface, borderWidth: 1, borderColor: c.rule2 },
        field: { backgroundColor: c.field, borderWidth: 1, borderColor: c.edge },
        button: () => ({}),
        thumb: { backgroundColor: dark ? c.rule2 : c.bg, borderWidth: 1, borderColor: c.rule2 },
      };
    case 'glass': {
      const edge = dark ? 'rgba(255,255,255,0.13)' : 'rgba(255,255,255,0.7)';
      return {
        name, r,
        card: { backgroundColor: withAlpha(c.surface, dark ? 0.55 : 0.62), borderWidth: 1, borderColor: edge, boxShadow: `0 8px 24px -8px rgba(0,0,0,${dark ? 0.5 : 0.12})` },
        field: { backgroundColor: withAlpha(c.surface, dark ? 0.4 : 0.55), borderWidth: 1, borderColor: edge },
        button: () => ({ boxShadow: `inset 0 1px 0 rgba(255,255,255,0.3), 0 6px 16px -6px ${withAlpha(c.accent, 0.6)}` }),
        thumb: { backgroundColor: withAlpha(c.surface, 0.85), borderWidth: 1, borderColor: edge },
      };
    }
    case 'keycap':
      return {
        name, r,
        card: { backgroundColor: c.surface, borderWidth: 1, borderColor: c.rule2, borderBottomWidth: 3 },
        field: { backgroundColor: c.field, borderWidth: 1, borderColor: c.rule2, boxShadow: `inset 0 2px 0 ${withAlpha('#000000', dark ? 0.4 : 0.05)}` },
        button: (fill, edge, pressed) => ({
          boxShadow: `inset 0 1px 0 rgba(255,255,255,0.25), 0 ${pressed ? 1 : 3}px 0 0 ${edge}`,
          transform: [{ translateY: pressed ? 2 : 0 }],
        }),
        thumb: { backgroundColor: dark ? c.rule2 : c.bg, boxShadow: `0 2px 0 0 ${c.rule2}` },
      };
    case 'brutal':
      return {
        name, r,
        card: { backgroundColor: c.surface, borderWidth: 2, borderColor: c.ink, boxShadow: `4px 4px 0 0 ${c.ink}` },
        field: { backgroundColor: c.bg, borderWidth: 2, borderColor: c.ink },
        button: (fill, edge, pressed) => ({
          borderWidth: 2,
          borderColor: c.ink,
          boxShadow: `${pressed ? 1 : 3}px ${pressed ? 1 : 3}px 0 0 ${c.ink}`,
          transform: [{ translateX: pressed ? 2 : 0 }, { translateY: pressed ? 2 : 0 }],
        }),
        thumb: { backgroundColor: c.accent, borderWidth: 2, borderColor: c.ink },
      };
    default:
      return {
        name: 'soft', r,
        card: { backgroundColor: c.surface, ...(dark ? null : { boxShadow: '0 1px 2px rgba(0,0,0,0.05), 0 4px 14px -6px rgba(0,0,0,0.08)' }) },
        field: { backgroundColor: c.field, borderWidth: 1, borderColor: 'transparent' },
        button: () => ({ boxShadow: `inset 0 1px 0 rgba(255,255,255,0.2), 0 1px 2px rgba(0,0,0,${dark ? 0.5 : 0.12})` }),
        thumb: { backgroundColor: dark ? c.rule2 : c.bg, boxShadow: '0 2px 6px rgba(0,0,0,0.12)' },
      };
  }
}

export function useTheme(): Theme {
  const t = useContext(Ctx);
  if (!t) throw new Error('PlankUI Mobile: wrap your app in <PlankProvider>.');
  return t;
}

/** '#1e64ef' + 0.12 -> 'rgba(30,100,239,0.12)'. Non-hex colours pass through. */
export function withAlpha(hex: string, a: number) {
  const m = /^#([0-9a-f]{6})$/i.exec(hex);
  if (!m) return hex;
  const n = parseInt(m[1], 16);
  return `rgba(${n >> 16},${(n >> 8) & 255},${n & 255},${a})`;
}

/** Native driver for transforms and opacity; web has none. */
export const ND = Platform.OS !== 'web';

const rgb = (hex: string) => {
  const n = parseInt(hex.slice(1), 16);
  return [n >> 16, (n >> 8) & 255, n & 255];
};
const toHex = (v: number[]) => '#' + v.map((x) => Math.round(Math.max(0, Math.min(255, x))).toString(16).padStart(2, '0')).join('');

/** Blend two hex colours: amount 0 = a, 1 = b. */
export function mix(a: string, b: string, amount: number) {
  const x = rgb(a), y = rgb(b);
  return toHex(x.map((v, i) => v + (y[i]! - v) * amount));
}

/** Lighten (+) or darken (-) a hex colour towards white or black. */
export function shade(hex: string, amount: number) {
  return mix(hex, amount > 0 ? '#ffffff' : '#000000', Math.abs(amount));
}
