import { create } from 'zustand';

import type { Platform } from '~/framework/util/appConf';

import type { PlatformAuthContext } from '../model';

type State = {
  /** Auth context (password rules, cgu...) of each platform, by platform name. Remote config of the platform: does not depend on the session. */
  contexts: Record<Platform['name'], PlatformAuthContext | undefined>;
};

type Action = {
  setContext: (platform: Platform['name'], context: PlatformAuthContext) => void;
};

export const usePlatformContextStore = create<State & Action>()(set => ({
  contexts: {},
  setContext: (platform, context) => set(state => ({ contexts: { ...state.contexts, [platform]: context } })),
}));

export const usePlatformContext = (platform?: Platform['name']) =>
  usePlatformContextStore(s => (platform ? s.contexts[platform] : undefined));

export const getPlatformContext = (platform?: Platform['name']) =>
  platform ? usePlatformContextStore.getState().contexts[platform] : undefined;
