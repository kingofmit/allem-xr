'use client'

import { createContext, useContext } from 'react'
import type { PhysicsContextValue } from './types'

export const PhysicsContext = createContext<PhysicsContextValue | null>(null)

export function usePhysicsContext(): PhysicsContextValue {
  const ctx = useContext(PhysicsContext)
  if (!ctx) {
    throw new Error(
      `allem-xr: usePhysicsContext() must be used inside <PhysicsWorld>.\n\n` +
      `  <PhysicsWorld>\n` +
      `    <YourComponent />  ← physics hooks work here\n` +
      `  </PhysicsWorld>\n`
    )
  }
  return ctx
}
