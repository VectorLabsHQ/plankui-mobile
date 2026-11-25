import { useState } from 'react';
import { Keyboard, Pressable, TextInput, View, type TextInputProps } from 'react-native';
import { useTheme } from '../theme';
import { Glyph } from './Glyph';
import { Text } from './Text';

export type SearchFieldProps = Omit<TextInputProps, 'style' | 'value' | 'onChangeText'> & {
  value: string;
  onChangeText: (v: string) => void;
};

/** iOS: grey rounded field with a Cancel button while focused. Android: Material 3 search bar (pill). */
export function SearchField({ value, onChangeText, placeholder = 'Search', onFocus, onBlur, ...rest }: SearchFieldProps) {
  const t = useTheme();
  const android = t.os === 'android';
  const [focus, setFocus] = useState(false);
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
      <View
        style={{
          flex: 1,
          flexDirection: 'row',
          alignItems: 'center',
          gap: android ? 16 : 6,
          height: android ? 56 : 38,
          paddingHorizontal: android ? 16 : 8,
          borderRadius: android ? 28 : 10,
          backgroundColor: android ? t.c.field : t.c.fill,
        }}
      >
        <Glyph name="search" color={t.c.muted} size={android ? 20 : 16} />
        <TextInput
          {...rest}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={t.c.muted}
          selectionColor={t.c.accent}
          cursorColor={t.c.accent}
          returnKeyType="search"
          accessibilityRole="search"
          accessibilityLabel={placeholder}
          clearButtonMode="while-editing"
          onFocus={(e) => {
            setFocus(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocus(false);
            onBlur?.(e);
          }}
          style={[{ flex: 1, fontSize: android ? 16 : 17, color: t.c.ink, height: '100%' }, { outlineStyle: 'none' } as object]}
        />
      </View>
      {!android && (focus || value) ? (
        <Pressable onPress={() => { onChangeText(''); Keyboard.dismiss(); }} accessibilityRole="button" hitSlop={8} style={{ height: 44, justifyContent: 'center' }}>
          <Text style={{ color: t.c.accent }}>Cancel</Text>
        </Pressable>
      ) : null}
    </View>
  );
}
