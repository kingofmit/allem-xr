import type { Vector3, Color } from 'three'

export type UIInteractionState = 'idle' | 'hovered' | 'active'

export interface PanelProps {
  children?: React.ReactNode
  /** Position in 3D space [x, y, z] */
  position?: [number, number, number]
  /** Width in meters. Default: 0.4 */
  width?: number
  /** Height in meters. Default: 0.3 */
  height?: number
  /** Billboard toward camera. Default: false */
  followGaze?: boolean
  /** Background color. Default: 'rgba(0,0,0,0.85)' */
  backgroundColor?: string
  /** Background opacity 0-1. Default: 0.85 */
  backgroundOpacity?: number
  /** Corner radius in meters. Default: 0.01 */
  borderRadius?: number
  /** Padding in meters. Default: 0.01 */
  padding?: number
  /** Whether panel is visible. Default: true */
  visible?: boolean
}

export interface ButtonProps {
  children?: React.ReactNode
  /** Called on select (pinch, click, gaze-dwell, trigger) */
  onSelect?: () => void
  /** Called on hover start */
  onHover?: () => void
  /** Called on hover end */
  onUnhover?: () => void
  /** Width in meters. Default: 0.12 */
  width?: number
  /** Height in meters. Default: 0.04 */
  height?: number
  /** Default color */
  color?: string
  /** Color when hovered */
  hoverColor?: string
  /** Color when active/pressed */
  activeColor?: string
  /** Text color */
  textColor?: string
  /** Font size in meters. Default: 0.016 */
  fontSize?: number
  /** Disabled state */
  disabled?: boolean
  /** Position offset within parent */
  position?: [number, number, number]
}

export interface TextProps {
  children: string
  /** Font size in meters. Default: 0.02 */
  fontSize?: number
  /** Text color. Default: 'white' */
  color?: string
  /** Max width for wrapping in meters */
  maxWidth?: number
  /** Text alignment */
  textAlign?: 'left' | 'center' | 'right'
  /** Position offset */
  position?: [number, number, number]
  /** Bold text */
  bold?: boolean
  /** Line height multiplier. Default: 1.2 */
  lineHeight?: number
}

export interface SliderProps {
  /** Current value */
  value: number
  /** Value change callback */
  onChange: (value: number) => void
  /** Minimum value. Default: 0 */
  min?: number
  /** Maximum value. Default: 1 */
  max?: number
  /** Step size. Default: 0.01 */
  step?: number
  /** Track width in meters. Default: 0.2 */
  width?: number
  /** Label text */
  label?: string
  /** Track color */
  trackColor?: string
  /** Fill color */
  fillColor?: string
  /** Position offset */
  position?: [number, number, number]
}

export interface ToggleProps {
  checked: boolean
  onChange: (checked: boolean) => void
  label?: string
  /** Active color. Default: '#4488ff' */
  activeColor?: string
  /** Inactive color. Default: '#666666' */
  inactiveColor?: string
  /** Position offset */
  position?: [number, number, number]
}

export interface ProgressBarProps {
  /** Progress 0-1 */
  value: number
  /** Width in meters. Default: 0.2 */
  width?: number
  /** Label text */
  label?: string
  /** Fill color. Default: '#4488ff' */
  color?: string
  /** Track color. Default: '#333333' */
  trackColor?: string
  /** Position offset */
  position?: [number, number, number]
}

export interface TooltipProps {
  /** Text to display */
  text: string
  /** Target object ref to follow */
  target: React.RefObject<any>
  /** Offset from target. Default: [0, 0.06, 0] */
  offset?: [number, number, number]
  /** Whether tooltip is visible. Default: true */
  visible?: boolean
}

export interface RadialMenuProps {
  items: RadialMenuItem[]
  /** Whether menu is visible */
  visible: boolean
  /** Center position */
  position?: [number, number, number]
  /** Radius in meters. Default: 0.12 */
  radius?: number
  /** Item color. Default: '#333333' */
  itemColor?: string
  /** Item hover color. Default: '#4488ff' */
  itemHoverColor?: string
}

export interface RadialMenuItem {
  id: string
  label: string
  onSelect: () => void
  color?: string
}

export interface GazePointerProps {
  /** Pointer ring size in meters. Default: 0.005 */
  size?: number
  /** Distance from camera. Default: 1 */
  distance?: number
  /** Pointer color. Default: 'white' */
  color?: string
  /** Dwell time in ms for gaze-based selection. Default: 1000 */
  dwellTime?: number
  /** Whether to show the pointer. Default: true */
  visible?: boolean
}
