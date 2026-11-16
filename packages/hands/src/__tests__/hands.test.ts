import { describe, it, expect } from 'vitest'

describe('@allem-xr/hands exports', () => {
  it('exports all hooks', async () => {
    const mod = await import('../index')
    expect(mod.useHands).toBeDefined()
    expect(mod.useGesture).toBeDefined()
    expect(mod.useCustomGesture).toBeDefined()
    expect(mod.usePinchInteraction).toBeDefined()
    expect(mod.useGrabInteraction).toBeDefined()
  })

  it('exports components', async () => {
    const mod = await import('../index')
    expect(mod.HandModel).toBeDefined()
    expect(mod.HandRay).toBeDefined()
  })

  it('exports JOINT_NAMES with 25 entries', async () => {
    const mod = await import('../index')
    expect(mod.JOINT_NAMES).toBeDefined()
    expect(mod.JOINT_NAMES).toHaveLength(25)
    expect(mod.JOINT_NAMES).toContain('wrist')
    expect(mod.JOINT_NAMES).toContain('thumb-tip')
    expect(mod.JOINT_NAMES).toContain('index-finger-tip')
    expect(mod.JOINT_NAMES).toContain('pinky-finger-tip')
  })
})
