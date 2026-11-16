import { describe, it, expect } from 'vitest'

describe('@allem-xr/avatars exports', () => {
  it('exports all hooks', async () => {
    const mod = await import('../index')
    expect(mod.useAvatar).toBeDefined()
    expect(mod.useAvatarTracking).toBeDefined()
    expect(mod.useIK).toBeDefined()
  })

  it('exports all components', async () => {
    const mod = await import('../index')
    expect(mod.Avatar).toBeDefined()
    expect(mod.AvatarMirror).toBeDefined()
  })
})
