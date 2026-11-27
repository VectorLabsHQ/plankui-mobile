import { useState, type ComponentRef, type ReactNode, type Ref } from 'react';
import { TextInput, View, type StyleProp, type TextInputProps, type TextStyle } from 'react-native';
import { useTheme } from '../theme';
import { Text } from './Text';

export type TextFieldProps = Omit<TextInputProps, 'style'> & {
  label: string;
  hint?: string;
  /** Shown instead of the hint and read out by screen readers. */
  error?: string;
  inputStyle?: StyleProp<TextStyle>;
  /** Something inside the field on the right, such as a Show button. */
  right?: ReactNode;
  /** Show a "12/200" count under the field (needs maxLength). */
  counter?: boolean;
  ref?: Ref<ComponentRef<typeof TextInput>>;
};

/**
 * Filled rounded field.
 * Label is always visible (placeholders are not labels). Font size stays >= 16 so iOS Safari never zooms.
 */
export function TextField({ label, hint, error, onFocus, onBlur, editable = true, inputStyle, right, counter, ref, ...rest }: TextFieldProps) {
  const t = useTheme();
  const [focus, setFocus] = useState(false);
  const edge = error ? t.c.danger : focus ? t.c.accent : 'transparent';
  const showCount = !!counter && rest.maxLength !== undefined;
  const len = (rest.value ?? rest.defaultValue ?? '').length;

  return (
    <View style={{ gap: 6, opacity: editable ? 1 : 0.5 }}>
      <Text variant="footnote" tone={error ? 'danger' : 'ink2'} weight="500">
        {label}
      </Text>
      <View>
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
            minHeight: 44,
            paddingHorizontal: 12,
            paddingVertical: rest.multiline ? 12 : 0,
            fontSize: 16,
            color: t.c.ink,
            ...(t.look.field),
            borderRadius: t.look.r(10),
            borderWidth: Math.max(1.5, Number(t.look.field.borderWidth ?? 0)),
            borderColor: error || focus ? edge : (t.look.field.borderColor as string),
            backgroundColor: (t.look.field.backgroundColor as string),
            textAlignVertical: rest.multiline ? 'top' : 'center',
          },
          // web: the focus ring is drawn by our border
          { outlineStyle: 'none' } as object,
          right ? { paddingRight: 64 } : null,
          inputStyle,
        ]}
      />
      {right ? <View style={{ position: 'absolute', right: 4, top: 0, bottom: 0, justifyContent: 'center' }}>{right}</View> : null}
      </View>
      {error || hint || showCount ? (
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <Text variant="footnote" tone={error ? 'danger' : 'muted'} accessibilityLiveRegion={error ? 'polite' : 'none'} style={{ flex: 1 }}>
            {error ?? hint}
          </Text>
          {showCount ? (
            <Text variant="footnote" tone={len > rest.maxLength! * 0.9 ? 'danger' : 'muted'} style={{ fontVariant: ['tabular-nums'] }} accessibilityLabel={`${len} of ${rest.maxLength} characters`}>
              {`${len}/${rest.maxLength}`}
            </Text>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}
