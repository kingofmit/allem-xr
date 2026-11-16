import { describe, it, expect } from 'vitest'

describe('@allem-xr/spatial exports', () => {
  it('exports all hooks', async () => {
    const mod = await import('../index')
    expect(mod.useHitTest).toBeDefined()
    expect(mod.usePlanes).toBeDefined()
    expect(mod.useAnchor).toBeDefined()
    expect(mod.useSceneMesh).toBeDefined()
    expect(mod.useDepth).toBeDefined()
    expect(mod.useLightEstimate).toBeDefined()
  })

  it('exports all components', async () => {
    const mod = await import('../index')
    expect(mod.PlaneOverlay).toBeDefined()
    expect(mod.SurfacePlacer).toBeDefined()
    expect(mod.SceneMeshOccluder).toBeDefined()
  })
})
