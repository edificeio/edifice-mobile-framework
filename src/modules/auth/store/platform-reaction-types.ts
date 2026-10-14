import { create } from 'zustand';

import type { Platform } from '~/framework/util/appConf';

type State = {
  /** Valid reaction types for audience of each platform, by platform name. Remote config of the platform: does not depend on the session. */
  types: Record<Platform['name'], string[] | undefined>;
};

type Action = {
  setReactionTypes: (platform: Platform['name'], types: string[]) => void;
};

/**
 * ToDo: this does not belong to auth, move it to the `audience` module.
 */
export const usePlatformReactionTypesStore = create<State & Action>()(set => ({
  setReactionTypes: (platform, types) => set(state => ({ types: { ...state.types, [platform]: types } })),
  types: {},
}));

export const usePlatformReactionTypes = (platform?: Platform['name']) =>
  usePlatformReactionTypesStore(s => (platform ? s.types[platform] : undefined));

export const getPlatformReactionTypes = (platform?: Platform['name']) =>
  platform ? usePlatformReactionTypesStore.getState().types[platform] : undefined;
