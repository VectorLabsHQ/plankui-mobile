import type { ReactNode } from 'react';
import { View } from 'react-native';
import { useTheme } from '../theme';
import { Text } from './Text';

export type StepsProps = {
  /** One short name per step. */
  steps: string[];
  /** The step you are on, from 0. */
  current: number;
  /** "bar": segments with "Step 2 of 4" above (checkout, sign-up). "dots": a row of dots (onboarding). Default bar. */
  variant?: 'bar' | 'dots';
};

/** Where you are in a short flow: segments with the step's name, or onboarding dots. */
export function Steps({ steps, current, variant = 'bar' }: StepsProps) {
  const t = useTheme();
  const n = steps.length;
  const at = Math.max(0, Math.min(n - 1, current));
  const label = `Step ${at + 1} of ${n}${steps[at] ? `, ${steps[at]}` : ''}`;
  if (variant === 'dots') {
    return (
      <View accessible accessibilityRole="progressbar" accessibilityLabel={label} accessibilityValue={{ min: 1, max: n, now: at + 1 }} style={{ flexDirection: 'row', gap: 8, justifyContent: 'center', alignItems: 'center' }}>
        {steps.map((s, i) => (
          <View key={s + i} style={{ width: i === at ? 22 : 8, height: 8, borderRadius: 4, backgroundColor: i <= at ? t.c.accent : t.c.rule2, opacity: i < at ? 0.5 : 1 }} />
        ))}
      </View>
    );
  }
  const brutal = t.look.name === 'brutal';
  const head: ReactNode = (
    <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 8 }}>
      <Text variant="footnote" weight="600" tone="accent" style={{ textTransform: 'uppercase', letterSpacing: 0.4 }}>{`Step ${at + 1} of ${n}`}</Text>
      <Text variant="subhead" weight="500" style={{ flex: 1 }} numberOfLines={1}>{steps[at]}</Text>
      {at < n - 1 ? <Text variant="footnote" tone="muted" numberOfLines={1}>{`Next: ${steps[at + 1]}`}</Text> : null}
    </View>
  );
  return (
    <View accessible accessibilityRole="progressbar" accessibilityLabel={label} accessibilityValue={{ min: 1, max: n, now: at + 1 }} style={{ gap: 10 }}>
      {head}
      <View style={{ flexDirection: 'row', gap: 4 }}>
        {steps.map((s, i) => (
          <View
            key={s + i}
            style={{
              flex: 1,
              height: brutal ? 8 : 4,
              borderRadius: t.look.r(2),
              backgroundColor: i <= at ? t.c.accent : t.c.fill,
              ...(brutal ? { borderWidth: 2, borderColor: t.c.ink } : null),
            }}
          />
        ))}
      </View>
    </View>
  );
}
