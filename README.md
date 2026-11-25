# PlankUI Mobile

React Native components that draw Apple's patterns on an iPhone and Material 3 on Android, from the same code. Same six themes and five styles as [PlankUI](https://plankui.com). Runs on the web too, through React Native Web.

Live demo and docs: [plankui.com/mobile](https://plankui.com/mobile)

## Install

In an Expo app:

```bash
npx expo install plankui-mobile react-native-safe-area-context expo-haptics
```

## Use

```tsx
import { useState } from 'react';
import { PlankProvider, ToastProvider, Screen, NavBar, ListSection, ListItem, Switch } from 'plankui-mobile';

export default function App() {
  const [on, setOn] = useState(true);
  return (
    <PlankProvider theme="ember" look="keycap">
      <ToastProvider>
        <Screen grouped header={<NavBar title="Settings" variant="large" />}>
          <ListSection title="Notifications">
            <ListItem title="Push" right={<Switch value={on} onValueChange={setOn} />} />
          </ListSection>
        </Screen>
      </ToastProvider>
    </PlankProvider>
  );
}
```

`PlankProvider` props:

- `theme`: volt, ember, grove, nebula, terminal, candy
- `look`: soft, flat, glass, keycap, brutal
- `accent`: blue, violet, emerald, vermilion, rose, amber, mono, or any hex colour
- `radius`: corner multiplier, 0 to 2
- `platform` and `scheme`: force iOS or Android patterns, light or dark (default: the device)

## Components

Navigation: NavBar (standard, center, large, medium, search, transparent, modal), NavBarButton, TabBar, SearchField.
Inputs: Button, TextField, Checkbox, RadioGroup, Switch, Slider, Stepper, SegmentedControl, Chip, ChipRow.
Lists and layout: Screen, Card, ListSection, ListItem, Divider.
Overlays: Sheet, Dialog, Toast.
Feedback: Banner, ProgressBar, Spinner, EmptyState.
Display: Text, Avatar, Badge, Glyph.

Each component picks the platform's own pattern: a centred title or a Material top bar, a round check or a square one, a pill toast or a snackbar. Touch targets are at least 44 pt on iOS and 48 dp on Android, and every control has screen-reader roles and labels.

## For AI agents

Paste this with the screens you want:

> Build this app's screens with PlankUI Mobile (plankui-mobile). Wrap the app in PlankProvider and ToastProvider. Every page is a Screen with a NavBar: variant "large" for tab roots, "standard" for pushed screens, "modal" inside sheets. Settings and forms use ListSection with ListItem, Switch and TextField. Use Sheet instead of a custom modal, Toast to confirm, Dialog only before something destructive. Never hard-code colours, radii or sizes: read them from useTheme().

## Licence

MIT, by Vector Labs.
