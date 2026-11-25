import { useRef, useState } from 'react';
import { PanResponder, View } from 'react-native';
import { useTheme } from '../theme';
import { haptic } from '../haptics';

export type SliderProps = {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
  accessibilityLabel: string;
  disabled?: boolean;
};

/**
 * Drag or tap anywhere on the track. iOS: thin track, white thumb. Android: Material 3 thick track and bar handle.
 * Screen readers can swipe up/down to change it by one step.
 */
export function Slider({ value, onChange, min = 0, max = 100, step = 1, accessibilityLabel, disabled }: SliderProps) {
  const t = useTheme();
  const android = t.os === 'android';
  const brutal = t.look.name === 'brutal';
  const [w, setW] = useState(0);
  const ref = useRef({ w, min, max, step, onChange, value, x0: 0 });
  ref.current = { ...ref.current, w, min, max, step, onChange, value };
  const clamp = (v: number) => Math.min(max, Math.max(min, Math.round(v / step) * step));
  const frac = (clamp(value) - min) / (max - min || 1);

  const set = (x: number) => {
    const r = ref.current;
    if (!r.w) return;
    const v = Math.min(r.max, Math.max(r.min, Math.round(((x / r.w) * (r.max - r.min) + r.min) / r.step) * r.step));
    if (v !== r.value) {
      if (v === r.min || v === r.max) haptic('select');
      r.onChange(v);
    }
  };

  const pan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderTerminationRequest: () => false,
      onPanResponderGrant: (e) => {
        ref.current.x0 = e.nativeEvent.locationX;
        set(e.nativeEvent.locationX);
      },
      onPanResponderMove: (_, g) => set(ref.current.x0 + g.dx),
    }),
  ).current;

  const track = android ? 16 : 4;
  const thumb = android ? { width: 4, height: 44, borderRadius: 2 } : { width: 28, height: 28, borderRadius: 14 };

  return (
    <View
      {...(disabled ? null : pan.panHandlers)}
      onLayout={(e) => setW(e.nativeEvent.layout.width)}
      accessible
      accessibilityRole="adjustable"
      accessibilityLabel={accessibilityLabel}
      accessibilityValue={{ min, max, now: clamp(value) }}
      accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
      onAccessibilityAction={(e) => onChange(clamp(value + (e.nativeEvent.actionName === 'increment' ? step : -step)))}
      style={[{ height: 44, justifyContent: 'center', opacity: disabled ? 0.4 : 1 }, { cursor: 'pointer', userSelect: 'none' } as object]}
    >
      <View pointerEvents="none" style={{ height: track, borderRadius: t.look.r(track / 2), backgroundColor: t.c.fill, overflow: 'hidden', ...(brutal ? { borderWidth: 2, borderColor: t.c.ink } : null) }}>
        <View style={{ width: `${frac * 100}%`, height: '100%', backgroundColor: t.c.accent }} />
      </View>
      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          left: Math.max(0, Math.min(w - thumb.width, frac * w - thumb.width / 2)),
          ...thumb,
          backgroundColor: android ? t.c.accent : '#ffffff',
          ...(android ? null : { boxShadow: '0 1px 2px rgba(0,0,0,0.2), 0 3px 8px rgba(0,0,0,0.15)' }),
          ...(brutal ? { borderWidth: 2, borderColor: t.c.ink, boxShadow: `2px 2px 0 0 ${t.c.ink}` } : null),
        }}
      />
    </View>
  );
}
