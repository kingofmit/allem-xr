import { describe, it, expect } from 'vitest'

describe('@allem-xr/audio exports', () => {
  it('exports all hooks', async () => {
    const mod = await import('../index')
    expect(mod.useSpatialAudio).toBeDefined()
    expect(mod.useAudioListener).toBeDefined()
    expect(mod.useAmbientAudio).toBeDefined()
  })

  it('exports all components', async () => {
    const mod = await import('../index')
    expect(mod.SpatialAudioSource).toBeDefined()
    expect(mod.AudioZone).toBeDefined()
    expect(mod.AmbientAudio).toBeDefined()
  })

  it('exports utilities', async () => {
    const mod = await import('../index')
    expect(mod.getAudioContext).toBeDefined()
    expect(mod.resumeAudioContext).toBeDefined()
  })
})

describe('getAudioContext', () => {
  it('returns AudioContext instance or throws if unavailable', async () => {
    const { getAudioContext } = await import('../audioContext')
    if (typeof globalThis.AudioContext !== 'undefined') {
      const ctx = getAudioContext()
      expect(ctx).toBeDefined()
    } else {
      expect(() => getAudioContext()).toThrow()
    }
  })
})
