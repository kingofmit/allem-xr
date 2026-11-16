# @allem-xr/ui

Spatial UI components for mixed reality -- panels, buttons, sliders, radial menus, and gaze interaction.

## Installation

```bash
npm install @allem-xr/ui @allem-xr/core @react-three/fiber three
```

## Quick Start

```tsx
import { UIProvider, Panel, Button, Text, Slider } from '@allem-xr/ui'

function Menu() {
  const [brightness, setBrightness] = useState(0.5)

  return (
    <UIProvider>
      <Panel position={[0, 1.5, -1]} followGaze>
        <Text fontSize={0.024} bold>Settings</Text>
        <Slider value={brightness} onChange={setBrightness} label="Brightness" />
        <Button onSelect={() => console.log('OK')}>Confirm</Button>
      </Panel>
    </UIProvider>
  )
}
```

## Components

### `<UIProvider>`

Context provider for UI interaction state. Wrap around your UI components.

### `<Panel>`

Floating panel container for spatial UI elements.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `position` | `[x, y, z]` | -- | Position in 3D space |
| `width` | `number` | `0.4` | Width in meters |
| `height` | `number` | `0.3` | Height in meters |
| `followGaze` | `boolean` | `false` | Billboard toward camera |
| `backgroundColor` | `string` | `'rgba(0,0,0,0.85)'` | Background color |
| `backgroundOpacity` | `number` | `0.85` | Background opacity |
| `borderRadius` | `number` | `0.01` | Corner radius in meters |
| `padding` | `number` | `0.01` | Padding in meters |
| `visible` | `boolean` | `true` | Visibility |

### `<Button>`

Interactive button with hover/active states. Responds to pinch, click, gaze-dwell, and trigger.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `onSelect` | `() => void` | -- | Selection callback |
| `onHover` | `() => void` | -- | Hover start callback |
| `onUnhover` | `() => void` | -- | Hover end callback |
| `width` | `number` | `0.12` | Width in meters |
| `height` | `number` | `0.04` | Height in meters |
| `color` | `string` | -- | Default color |
| `hoverColor` | `string` | -- | Hovered color |
| `activeColor` | `string` | -- | Active/pressed color |
| `textColor` | `string` | -- | Text color |
| `fontSize` | `number` | `0.016` | Font size in meters |
| `disabled` | `boolean` | -- | Disabled state |
| `position` | `[x, y, z]` | -- | Position offset |

### `<Text>`

Renders text in 3D space.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `string` | required | Text content |
| `fontSize` | `number` | `0.02` | Font size in meters |
| `color` | `string` | `'white'` | Text color |
| `maxWidth` | `number` | -- | Max width for wrapping |
| `textAlign` | `'left' \| 'center' \| 'right'` | -- | Alignment |
| `bold` | `boolean` | -- | Bold text |
| `lineHeight` | `number` | `1.2` | Line height multiplier |
| `position` | `[x, y, z]` | -- | Position offset |

### `<SpatialText>`

Extended text component for spatial rendering.

### `<Slider>`

Draggable value slider.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `number` | required | Current value |
| `onChange` | `(value: number) => void` | required | Change callback |
| `min` | `number` | `0` | Minimum value |
| `max` | `number` | `1` | Maximum value |
| `step` | `number` | `0.01` | Step size |
| `width` | `number` | `0.2` | Track width in meters |
| `label` | `string` | -- | Label text |
| `trackColor` | `string` | -- | Track color |
| `fillColor` | `string` | -- | Fill color |
| `position` | `[x, y, z]` | -- | Position offset |

### `<Toggle>`

On/off toggle switch.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `checked` | `boolean` | required | Checked state |
| `onChange` | `(checked: boolean) => void` | required | Change callback |
| `label` | `string` | -- | Label text |
| `activeColor` | `string` | `'#4488ff'` | Active color |
| `inactiveColor` | `string` | `'#666666'` | Inactive color |
| `position` | `[x, y, z]` | -- | Position offset |

### `<ProgressBar>`

Visual progress indicator.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `number` | required | Progress 0-1 |
| `width` | `number` | `0.2` | Width in meters |
| `label` | `string` | -- | Label text |
| `color` | `string` | `'#4488ff'` | Fill color |
| `trackColor` | `string` | `'#333333'` | Track color |
| `position` | `[x, y, z]` | -- | Position offset |

### `<Tooltip>`

Tooltip that follows a target object.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `text` | `string` | required | Tooltip text |
| `target` | `RefObject<any>` | required | Target object ref |
| `offset` | `[x, y, z]` | `[0, 0.06, 0]` | Offset from target |
| `visible` | `boolean` | `true` | Visibility |

### `<RadialMenu>`

Circular selection menu.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `items` | `RadialMenuItem[]` | required | Menu items |
| `visible` | `boolean` | required | Visibility |
| `position` | `[x, y, z]` | -- | Center position |
| `radius` | `number` | `0.12` | Radius in meters |
| `itemColor` | `string` | `'#333333'` | Item color |
| `itemHoverColor` | `string` | `'#4488ff'` | Item hover color |

`RadialMenuItem`: `{ id: string, label: string, onSelect: () => void, color?: string }`

### `<GazePointer>`

Gaze-based pointer with dwell selection.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `size` | `number` | `0.005` | Ring size in meters |
| `distance` | `number` | `1` | Distance from camera |
| `color` | `string` | `'white'` | Pointer color |
| `dwellTime` | `number` | `1000` | Dwell time in ms |
| `visible` | `boolean` | `true` | Visibility |

## Hooks

### `useGazeInteraction()`

Hook for gaze-based interaction logic.

### `useUIContext()`

Access the UI context (interaction state).

## License

MIT
