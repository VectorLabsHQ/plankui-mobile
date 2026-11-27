import { useState } from 'react';
import { Pressable } from 'react-native';
import { useTheme } from '../theme';
import { haptic } from '../haptics';
import { Text } from './Text';
import { TextField, type TextFieldProps } from './TextField';

export type PasswordFieldProps = Omit<TextFieldProps, 'secureTextEntry' | 'right' | 'label'> & {
  /** Default "Password". */
  label?: string;
  /** "new" asks password managers to suggest one; "current" offers the saved one. Default current. */
  kind?: 'current' | 'new';
};

/** A password field with a Show / Hide button inside it. Autofill and password managers keep working. */
export function PasswordField({ kind = 'current', label = 'Password', ...rest }: PasswordFieldProps) {
  const t = useTheme();
  const [shown, setShown] = useState(false);
  return (
    <TextField
      {...rest}
      label={label}
      secureTextEntry={!shown}
      autoCapitalize="none"
      autoCorrect={false}
      autoComplete={kind === 'new' ? 'new-password' : 'current-password'}
      textContentType={kind === 'new' ? 'newPassword' : 'password'}
      right={
        <Pressable
          onPress={() => {
            haptic('select');
            setShown((v) => !v);
          }}
          accessibilityRole="button"
          accessibilityLabel={shown ? 'Hide password' : 'Show password'}
          hitSlop={6}
          style={({ pressed }) => ({ minHeight: 36, paddingHorizontal: 10, justifyContent: 'center', opacity: pressed ? 0.5 : 1 })}
        >
          <Text variant="subhead" weight="600" style={{ color: t.c.accent }}>{shown ? 'Hide' : 'Show'}</Text>
        </Pressable>
      }
    />
  );
}

export type TextAreaProps = Omit<TextFieldProps, 'multiline'> & {
  /** Visible lines before it scrolls. Default 4. */
  rows?: number;
};

/** Several lines of text, with an optional character count (set maxLength and counter). */
export function TextArea({ rows = 4, inputStyle, ...rest }: TextAreaProps) {
  return <TextField {...rest} multiline inputStyle={[{ minHeight: 24 + rows * 22, maxHeight: 24 + rows * 2 * 22 }, inputStyle]} />;
}
