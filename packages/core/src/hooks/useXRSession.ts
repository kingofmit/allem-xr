'use client'

import { useXRContext } from '../context'

/**
 * Convenience hook for session management.
 */
export function useXRSession() {
  const ctx = useXRContext()
  return {
    session: ctx.state.session,
    isActive: ctx.state.isPresenting,
    state: ctx.state.sessionState,
    start: ctx.start,
    end: ctx.end,
  }
}
