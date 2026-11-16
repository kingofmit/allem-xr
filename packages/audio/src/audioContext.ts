'use client'

let _audioContext: AudioContext | null = null

export function getAudioContext(): AudioContext {
  if (!_audioContext) {
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
