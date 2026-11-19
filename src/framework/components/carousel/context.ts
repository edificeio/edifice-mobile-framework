import { createContext } from 'react';

/**
 * Contexts shared between the carousel screen and its items.
 * The carousel lib can render duplicate components for the same index: these contexts share and reset their internal states.
 */

export interface PdfContextValue {
  disableCarouselSwipe?: () => void;
  setResetComponent?: () => void;
}

export interface PlayerContextValue {
  pauseCurrentPlayingMedia?: () => void;
  savedStates: Map<number, { position: number; paused: boolean }>;
}

export const PdfContext = createContext<PdfContextValue>({});

export const PlayerContext = createContext<PlayerContextValue>({ savedStates: new Map() });
