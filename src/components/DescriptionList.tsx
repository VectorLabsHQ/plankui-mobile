import type { ReactNode } from 'react';
import { View } from 'react-native';
import { useTheme } from '../theme';
import { Text } from './Text';

export type DescriptionItem = {
  label: string;
  value: ReactNode;
  /** Draws the row in bold with a line above it, for a total. */
  emphasis?: boolean;
};

export type DescriptionListProps = {
  items: DescriptionItem[];
  /** "rows": label left, value right (receipts, details). "stacked": label above value (profiles, long values). Default rows. */
  layout?: 'rows' | 'stacked';
};

/** Label and value pairs: an order summary, a receipt, account details. */
export function DescriptionList({ items, layout = 'rows' }: DescriptionListProps) {
  const t = useTheme();
  return (
    <View accessibilityRole="list">
      {items.map((it, i) => {
        const value =
          typeof it.value === 'string' || typeof it.value === 'number' ? (
            <Text
              variant={it.emphasis ? 'headline' : 'callout'}
              weight={it.emphasis ? '600' : undefined}
              style={{ fontVariant: ['tabular-nums'], textAlign: layout === 'rows' ? 'right' : 'left', flexShrink: 1 }}
            >
              {it.value}
            </Text>
          ) : (
            it.value
          );
        return (
          <View
            key={it.label + i}
            accessible
            accessibilityLabel={typeof it.value === 'string' || typeof it.value === 'number' ? `${it.label}, ${it.value}` : it.label}
            style={{
              flexDirection: layout === 'rows' ? 'row' : 'column',
              alignItems: layout === 'rows' ? 'baseline' : 'flex-start',
              justifyContent: 'space-between',
              gap: layout === 'rows' ? 16 : 2,
              paddingVertical: 10,
              borderTopWidth: it.emphasis ? 1 : i ? 0.5 : 0,
              borderColor: it.emphasis ? t.c.rule2 : t.c.rule,
              marginTop: it.emphasis ? 4 : 0,
            }}
          >
            <Text variant={it.emphasis ? 'headline' : 'subhead'} tone={it.emphasis ? 'ink' : 'muted'} weight={it.emphasis ? '600' : undefined}>{it.label}</Text>
            {value}
          </View>
        );
      })}
    </View>
  );
}
