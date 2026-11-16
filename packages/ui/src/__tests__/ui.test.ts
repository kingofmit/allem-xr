import { describe, it, expect } from 'vitest'

describe('@allem-xr/ui exports', () => {
  it('exports all components', async () => {
    const mod = await import('../index')
    expect(mod.UIProvider).toBeDefined()
    expect(mod.Panel).toBeDefined()
    expect(mod.Button).toBeDefined()
    expect(mod.Text).toBeDefined()
    expect(mod.SpatialText).toBeDefined()
    expect(mod.Slider).toBeDefined()
    expect(mod.Toggle).toBeDefined()
    expect(mod.ProgressBar).toBeDefined()
    expect(mod.Tooltip).toBeDefined()
    expect(mod.RadialMenu).toBeDefined()
    expect(mod.GazePointer).toBeDefined()
  })

  it('exports hooks', async () => {
    const mod = await import('../index')
    expect(mod.useGazeInteraction).toBeDefined()
  })

  it('exports context', async () => {
    const mod = await import('../index')
    expect(mod.UIContext).toBeDefined()
    expect(mod.useUIContext).toBeDefined()
  })
})
