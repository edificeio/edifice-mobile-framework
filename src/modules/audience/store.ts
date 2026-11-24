import { create } from 'zustand';

import type { Platform } from '~/framework/util/appConf';

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
