export function featureError(feature: string, hook: string): string {
  const featureGuide: Record<string, string> = {
    'hand-tracking': `  Device support: Quest 2+ \u2713, Quest Pro \u2713, Vision Pro \u2713\n  Browser support: Chrome \u2713, Quest Browser \u2713, Safari visionOS \u2713`,
    'hit-test': `  Device support: Quest 2+ \u2713, Quest Pro \u2713\n  Browser support: Chrome \u2713, Quest Browser \u2713`,
    'anchors': `  Device support: Quest 2+ \u2713 (persistent), Chrome partial\n  Browser support: Quest Browser \u2713, Chrome \u2713`,
    'plane-detection': `  Device support: Quest 2+ \u2713\n  Browser support: Quest Browser \u2713, Chrome partial`,
    'mesh-detection': `  Device support: Quest 3 \u2713\n  Browser support: Quest Browser \u2713`,
    'depth-sensing': `  Device support: Quest 2+ \u2713\n  Browser support: Quest Browser \u2713, Chrome experimental`,
    'light-estimation': `  Device support: Quest 2+ \u2713\n  Browser support: Chrome 90+ \u2713, Edge 90+ \u2713`,
  }

  const guide = featureGuide[feature] ?? ''

  return (
    `allem-xr: ${hook} requires the '${feature}' feature, which is not available.\n\n` +
    `  Add it to your XRProvider:\n\n` +
    `  <XRProvider features={['${feature}']}>\n\n` +
    (guide ? `${guide}\n` : '')
  )
}

export function providerError(hook: string): string {
  return (
    `allem-xr: ${hook} must be used inside <XRProvider>.\n\n` +
    `  Wrap your app with XRProvider:\n\n` +
    `  <XRProvider>\n` +
    `    <Canvas>\n` +
    `      <XRScene>\n` +
    `        <YourComponent />  \u2190 ${hook} works here\n` +
    `      </XRScene>\n` +
    `    </Canvas>\n` +
    `  </XRProvider>\n`
  )
}
