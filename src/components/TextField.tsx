import { useState, type ComponentRef, type Ref } from 'react';
import { TextInput, View, type StyleProp, type TextInputProps, type TextStyle } from 'react-native';
import { useTheme } from '../theme';
import { Text } from './Text';

export type TextFieldProps = Omit<TextInputProps, 'style'> & {
  label: string;
  hint?: string;
  /** Shown instead of the hint and read out by screen readers. */
  error?: string;
  inputStyle?: StyleProp<TextStyle>;
  ref?: Ref<ComponentRef<typeof TextInput>>;
};

/**
 * iOS: filled rounded field. Android: Material outlined field.
 * Label is always visible (placeholders are not labels). Font size stays >= 16 so iOS Safari never zooms.
 */
export function TextField({ label, hint, error, onFocus, onBlur, editable = true, inputStyle, ref, ...rest }: TextFieldProps) {
  const t = useTheme();
  const android = t.os === 'android';
  const [focus, setFocus] = useState(false);
  const edge = error ? t.c.danger : focus ? t.c.accent : android ? t.c.muted : 'transparent';

  return (
    <View style={{ gap: 6, opacity: editable ? 1 : 0.5 }}>
      <Text variant={android ? 'subhead' : 'footnote'} tone={error ? 'danger' : focus && android ? 'accent' : 'ink2'} weight="500">
        {label}
      </Text>
      <TextInput
        ref={ref}
        {...rest}
        editable={editable}
        accessibilityLabel={label}
        accessibilityHint={error ?? hint}
        placeholderTextColor={t.c.muted}
        selectionColor={t.c.accent}
        cursorColor={t.c.accent}
        onFocus={(e) => {
          setFocus(true);
          onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocus(false);
          onBlur?.(e);
        }}
        style={[
          {
            minHeight: android ? 56 : 44,
            paddingHorizontal: android ? 16 : 12,
            paddingVertical: rest.multiline ? 12 : 0,
            fontSize: 16,
            color: t.c.ink,
            ...(android ? null : t.look.field),
            borderRadius: t.look.r(android ? 4 : 10),
            borderWidth: android ? (focus || error ? 2 : 1) : Math.max(1.5, Number(t.look.field.borderWidth ?? 0)),
            borderColor: error || focus ? edge : android ? (t.look.name === 'brutal' ? t.c.ink : t.c.edge) : (t.look.field.borderColor as string),
            backgroundColor: android ? 'transparent' : (t.look.field.backgroundColor as string),
            textAlignVertical: rest.multiline ? 'top' : 'center',
          },
          // web: the focus ring is drawn by our border
          { outlineStyle: 'none' } as object,
          inputStyle,
        ]}
      />
      {error || hint ? (
        <Text variant="footnote" tone={error ? 'danger' : 'muted'} accessibilityLiveRegion={error ? 'polite' : 'none'}>
          {error ?? hint}
        </Text>
      ) : null}
    </View>
  );
}
