export interface SpatialAudioConfig {
  position?: [number, number, number]
  maxDistance?: number
  rolloffFactor?: number
  refDistance?: number
  coneInnerAngle?: number
  coneOuterAngle?: number
  coneOuterGain?: number
  loop?: boolean
  volume?: number
  autoplay?: boolean
  hrtf?: boolean
}

export interface SpatialAudioState {
  play: () => void
  pause: () => void
  stop: () => void
  seek: (time: number) => void
  setPosition: (x: number, y: number, z: number) => void
  setVolume: (volume: number) => void
  isPlaying: boolean
  currentTime: number
  duration: number
}

export interface AudioListenerState {
  setPosition: (x: number, y: number, z: number) => void
  setOrientation: (fx: number, fy: number, fz: number, ux: number, uy: number, uz: number) => void
}

export interface SpatialAudioSourceProps {
  src: string
  position?: [number, number, number]
  maxDistance?: number
  rolloffFactor?: number
  refDistance?: number
  loop?: boolean
  volume?: number
  autoplay?: boolean
  hrtf?: boolean
}

export interface AudioZoneProps {
  children?: React.ReactNode
  position?: [number, number, number]
  radius?: number
  volume?: number
  reverb?: 'none' | 'small-room' | 'hall' | 'cave' | 'outdoor'
  dampening?: number
}

export interface AmbientAudioProps {
  src: string
  volume?: number
  loop?: boolean
  autoplay?: boolean
}
