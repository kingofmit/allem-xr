import { describe, it, expect, vi } from 'vitest'

// Test type exports exist
describe('@allem-xr/core exports', () => {
  it('exports XRProvider component', async () => {
    const mod = await import('../index')
    expect(mod.XRProvider).toBeDefined()
    expect(typeof mod.XRProvider).toBe('function')
  })

  it('exports XRScene component', async () => {
    const mod = await import('../index')
    expect(mod.XRScene).toBeDefined()
  })

  it('exports XROrigin component', async () => {
    const mod = await import('../index')
    expect(mod.XROrigin).toBeDefined()
  })

  it('exports all hooks', async () => {
    const mod = await import('../index')
    expect(mod.useXR).toBeDefined()
    expect(mod.useXRSession).toBeDefined()
    expect(mod.useXREvent).toBeDefined()
    expect(mod.useXRSupport).toBeDefined()
    expect(mod.useXRInput).toBeDefined()
    expect(mod.useXRFrame).toBeDefined()
  })

  it('exports context', async () => {
    const mod = await import('../index')
    expect(mod.XRContext).toBeDefined()
    expect(mod.useXRContext).toBeDefined()
  })

  it('exports error helpers', async () => {
    const mod = await import('../index')
    expect(mod.featureError).toBeDefined()
    expect(mod.providerError).toBeDefined()
  })
})

describe('featureError', () => {
  it('returns helpful error message', async () => {
    const { featureError } = await import('../errors')
    const msg = featureError('hand-tracking', 'useHands')
    expect(msg).toContain('hand-tracking')
    expect(msg).toContain('useHands')
    expect(msg).toContain('XRProvider')
  })
})

describe('providerError', () => {
  it('returns helpful error message', async () => {
    const { providerError } = await import('../errors')
    const msg = providerError('useXR()')
    expect(msg).toContain('useXR()')
    expect(msg).toContain('XRProvider')
  })
})

describe('useXRContext', () => {
  it('throws when used outside provider', async () => {
    const { useXRContext } = await import('../context')
    // Calling outside React will throw
    expect(() => useXRContext()).toThrow()
  })
})

describe('defaultState', () => {
  it('has correct initial values', async () => {
    const { defaultState } = await import('../context')
    expect(defaultState.session).toBeNull()
    expect(defaultState.sessionState).toBe('idle')
    expect(defaultState.isPresenting).toBe(false)
    expect(defaultState.isAR).toBe(false)
    expect(defaultState.isVR).toBe(false)
    expect(defaultState.referenceSpace).toBeNull()
    expect(defaultState.inputSources).toEqual([])
    expect(defaultState.error).toBeNull()
  })
})
