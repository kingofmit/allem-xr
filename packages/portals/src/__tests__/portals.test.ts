import { describe, it, expect } from 'vitest'

describe('@allem-xr/portals exports', () => {
  it('exports all components', async () => {
    const mod = await import('../index')
    expect(mod.Portal).toBeDefined()
    expect(mod.SceneTransition).toBeDefined()
    expect(mod.Guardian).toBeDefined()
    expect(mod.PassthroughWindow).toBeDefined()
  })

  it('exports all hooks', async () => {
    const mod = await import('../index')
    expect(mod.useSceneTransition).toBeDefined()
    expect(mod.useGuardian).toBeDefined()
    expect(mod.usePassthrough).toBeDefined()
  })
})
