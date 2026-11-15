/** Supported XR session modes. */
export type XRMode = "inline" | "immersive-vr" | "immersive-ar";

/** State of the current XR session. */
export type XRSessionState = "idle" | "requesting" | "active" | "ending" | "error";

/** Configuration for the XR provider. */
export interface XRConfig {
  /** Preferred session mode. Defaults to "immersive-ar". */
  preferredMode?: XRMode;
  /** Required WebXR features. */
  requiredFeatures?: string[];
  /** Optional WebXR features. */
  optionalFeatures?: string[];
  /** Whether to automatically request a session on mount. */
  autoStart?: boolean;
}

/** Context value exposed by XRProvider. */
export interface XRContextValue {
  /** Current session state. */
  state: XRSessionState;
  /** Active XR mode, or null if no session. */
  mode: XRMode | null;
  /** Whether an XR session is currently presenting. */
  isPresenting: boolean;
  /** Whether WebXR is supported in this browser. */
  isSupported: boolean;
  /** The active XRSession, if any. */
  session: XRSession | null;
  /** Start an XR session. */
  start: (mode?: XRMode) => Promise<void>;
  /** End the current XR session. */
  end: () => Promise<void>;
  /** Provider configuration. */
  config: XRConfig;
}
