'use client'

let _audioContext: AudioContext | null = null

export function getAudioContext(): AudioContext {
  if (!_audioContext) {
    if (typeof window === 'undefined' || typeof AudioContext === 'undefined') {
      throw new Error('[allem-xr] AudioContext is not available in this environment')
    }
    _audioContext = new AudioContext()
  }
  return _audioContext
}

export async function resumeAudioContext(): Promise<void> {
  const ctx = getAudioContext()
  if (ctx.state === 'suspended') {
    await ctx.resume()
  }
}
