import { Children, useRef, useState, type ComponentRef, type ReactNode } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { useTheme } from '../theme';

export type PageControlProps = { count: number; index: number; onChange?: (index: number) => void };

/** Page dots, as on PlankUI's web Carousel: the current one stretches into an ink pill. Tapping a dot moves to it when onChange is set. */
export function PageControl({ count, index, onChange }: PageControlProps) {
  const t = useTheme();
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }} accessibilityRole="adjustable" accessibilityLabel={`Page ${index + 1} of ${count}`}>
      {Array.from({ length: count }, (_, i) => (
        <Pressable
          key={i}
          disabled={!onChange}
          onPress={() => onChange?.(i)}
          hitSlop={{ top: 12, bottom: 12 }}
          style={{ paddingHorizontal: 3, paddingVertical: 8 }}
          importantForAccessibility="no"
        >
          <View style={{ width: i === index ? 20 : 6, height: 6, borderRadius: 3, backgroundColor: i === index ? t.c.ink : t.c.rule2 }} />
        </Pressable>
      ))}
    </View>
  );
}

export type CarouselProps = {
  children: ReactNode;
  /** Width of each page as a share of the carousel; under 1 shows the edge of the next page. */
  peek?: number;
  gap?: number;
  /** Dots under the pages. Default on. */
  dots?: boolean;
  onIndexChange?: (index: number) => void;
};

/** Pages that snap one at a time, edge to edge with the screen padding, with page dots under them. */
export function Carousel({ children, peek = 0.86, gap = 12, dots = true, onIndexChange }: CarouselProps) {
  const pages = Children.toArray(children);
  const [w, setW] = useState(0);
  const [index, setIndex] = useState(0);
  const ref = useRef<ComponentRef<typeof ScrollView>>(null);
  const page = Math.round(w * peek);
  const step = page + gap;
  const go = (i: number) => ref.current?.scrollTo({ x: i * step, animated: true });
  return (
    <View style={{ gap: 4 }}>
      <View style={{ marginHorizontal: -16 }} onLayout={(e) => setW(e.nativeEvent.layout.width - 32)}>
        <ScrollView
          ref={ref}
          horizontal
          showsHorizontalScrollIndicator={false}
          snapToInterval={step || undefined}
          decelerationRate="fast"
          disableIntervalMomentum
          contentContainerStyle={{ paddingHorizontal: 16, gap }}
          scrollEventThrottle={16}
          onScroll={(e) => {
            if (!step) return;
            const i = Math.max(0, Math.min(pages.length - 1, Math.round(e.nativeEvent.contentOffset.x / step)));
            if (i !== index) {
              setIndex(i);
              onIndexChange?.(i);
            }
          }}
        >
          {w ? pages.map((p, i) => <View key={i} style={{ width: page }}>{p}</View>) : null}
        </ScrollView>
      </View>
      {dots && pages.length > 1 ? <PageControl count={pages.length} index={index} onChange={go} /> : null}
    </View>
  );
}
