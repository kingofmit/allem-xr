import { describe, it, expect } from 'vitest'

describe('@allem-xr/physics exports', () => {
  it('exports all components', async () => {
    const mod = await import('../index')
    expect(mod.PhysicsWorld).toBeDefined()
    expect(mod.RigidBody).toBeDefined()
    expect(mod.RealWorldCollider).toBeDefined()
  })

  it('exports all hooks', async () => {
    const mod = await import('../index')
    expect(mod.useCollision).toBeDefined()
    expect(mod.useHandPhysics).toBeDefined()
    expect(mod.useGravity).toBeDefined()
  })

  it('exports context', async () => {
    const mod = await import('../index')
    expect(mod.PhysicsContext).toBeDefined()
    expect(mod.usePhysicsContext).toBeDefined()
  })
})

describe('usePhysicsContext', () => {
  it('throws when used outside PhysicsWorld', async () => {
    const { usePhysicsContext } = await import('../context')
    expect(() => usePhysicsContext()).toThrow()
  })
})
