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
- `scheme`: force light or dark (default: the device); `platform` forces iOS or Android behaviour (tap targets, ripple)

## Components

Navigation: NavBar (standard, center, large, medium, search, transparent, modal), NavBarButton, TabBar, SearchField, Steps.
Inputs: Button, IconButton, TextField, PasswordField, TextArea, Select, Checkbox, RadioGroup, Switch, Slider, Stepper, SegmentedControl, Chip, ChipRow, Rating, Calendar.
Lists and layout: Screen, Card, ListSection, ListItem, DescriptionList, Divider, Carousel, PageControl, Timeline.
Overlays: Sheet, Dialog, Toast.
Feedback: Banner, ProgressBar, ProgressCircle, Meter, Spinner, EmptyState.
Display: Text, Avatar, AvatarGroup, Badge, StatusDot, Glyph, Stat, CountUp, BarList, BarChart, Sparkline, MessageBubble, TypingIndicator.

Every component looks the same on iOS, Android and the web, in PlankUI's own design. Only behaviour follows the platform: touch targets are at least 44 pt on iOS and 48 dp on Android, Android presses show its ripple, and the Android back button closes sheets and dialogs. Every control has screen-reader roles and labels.

## For AI agents

Paste this with the screens you want:

> Build this app's screens with PlankUI Mobile (plankui-mobile). Wrap the app in PlankProvider and ToastProvider. Every page is a Screen with a NavBar: variant "large" for tab roots, "standard" for pushed screens, "modal" inside sheets. Settings and forms use ListSection with ListItem, Switch and TextField. Use Sheet instead of a custom modal, Toast to confirm, Dialog only before something destructive. Never hard-code colours, radii or sizes: read them from useTheme().

## Licence

MIT, by Vector Labs.
