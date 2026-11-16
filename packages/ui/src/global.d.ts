// Type declarations for troika-three-text (which ships without types)
declare module 'troika-three-text' {
  import type { Mesh } from 'three'
  export class Text extends Mesh {
    text: string
    fontSize: number
    color: string | number
    maxWidth?: number
    textAlign?: string
    anchorX?: string | number
    anchorY?: string | number
    lineHeight?: number
    fontWeight?: string | number
    font?: string | null
    sync(): void
    dispose(): void
  }
}
