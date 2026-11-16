'use client'

import { createContext, useContext } from 'react'
import type { XRContextValue, XRState } from './types'

const defaultState: XRState = {
  session: null,
  sessionState: 'idle',
  mode: 'inline',
  isPresenting: false,
  isAR: false,
  isVR: false,
  referenceSpace: null,
  features: new Set(),
  inputSources: [],
  viewerPose: null,
  frame: null,
  error: null,
}

export const XRContext = createContext<XRContextValue | null>(null)

export function useXRContext(): XRContextValue {
  const ctx = useContext(XRContext)
  if (!ctx) {
    throw new Error(
      `allem-xr: useXR() must be used inside <XRProvider>.\n\n` +
      `  Wrap your app with XRProvider:\n\n` +
      `  <XRProvider>\n` +
      `    <Canvas>\n` +
      `      <XRScene>\n` +
      `        <YourComponent />  \u2190 useXR() works here\n` +
      `      </XRScene>\n` +
      `    </Canvas>\n` +
      `  </XRProvider>\n`
    )
  }
  return ctx
}

export { defaultState }
