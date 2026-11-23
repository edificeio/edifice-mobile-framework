import { create } from 'zustand';

import type { Platform } from '~/framework/util/appConf';
import type { AudiencePoint } from '~/modules/audience/model';

type ReactionTypesState = {
  /** Valid reaction types for audience of each platform, by platform name. Remote config of the platform: does not depend on the session. */
  types: Record<Platform['name'], string[] | undefined>;
};

type ReactionTypesAction = {
  setReactionTypes: (platform: Platform['name'], types: string[]) => void;
};

export const usePlatformReactionTypesStore = create<ReactionTypesState & ReactionTypesAction>()(set => ({
  setReactionTypes: (platform, types) => set(state => ({ types: { ...state.types, [platform]: types } })),
  types: {},
}));

export const usePlatformReactionTypes = (platform?: Platform['name']) =>
  usePlatformReactionTypesStore(s => (platform ? s.types[platform] : undefined));

export const getPlatformReactionTypes = (platform?: Platform['name']) =>
  platform ? usePlatformReactionTypesStore.getState().types[platform] : undefined;

type ReactionPickerGestureState = {
  /** Where the finger is, in the coordinates of the page. `undefined` until it moves. */
  point?: AudiencePoint;
  /** The finger left the screen. */
  released: boolean;
};

type ReactionPickerGestureAction = {
  move: (point: AudiencePoint) => void;
  release: () => void;
  reset: () => void;
};

/**
 * The gesture that opened the reaction picker (`audience/react`), while it goes on.
 * The touch stays with the react button that it started on, even once the picker is open over it: the button writes the gesture
 * here, the picker reads it to show the reaction under the finger, and to choose it when the finger leaves the screen.
 */
export const useReactionPickerGestureStore = create<ReactionPickerGestureState & ReactionPickerGestureAction>()(set => ({
  move: point => set({ point }),
  point: undefined,
  release: () => set({ released: true }),
  released: false,
  reset: () => set({ point: undefined, released: false }),
}));
