type PandaPlayerEvent =
  | 'panda_pause'
  | 'panda_play'
  | 'panda_ended'
  | 'panda_error'

interface PandaPlayerOptions {
  onReady: () => void
}

interface IPandaPlayer {
  onEvent: (callback: (event: { message: PandaPlayerEvent }) => void) => void
  destroy: () => void
  setCurrentTime: (time: number) => void
  getCurrentTime(): number
  play: () => void
}

declare class PandaPlayer implements IPandaPlayer {
  constructor(elementId: string, options: PandaPlayerOptions)
  onEvent: (callback: (event: { message: PandaPlayerEvent }) => void) => void
  destroy: () => void
  setCurrentTime: (time: number) => void
  getCurrentTime(): number
  play: () => void
}

interface Window {
  onPandaPlayerApiLoad?: () => void
}
