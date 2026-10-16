import { create } from 'zustand';

import type { Platform } from '~/framework/util/appConf';
import type { LegalUrls } from '~/modules/auth/model';

type State = {
  /** Legal urls (cgu, cookies...) of each platform, by platform name. Remote config of the platform: does not depend on the session. */
  urls: Record<Platform['name'], LegalUrls | undefined>;
};

type Action = {
  setLegalUrls: (platform: Platform['name'], urls: LegalUrls) => void;
};

export const usePlatformLegalUrlsStore = create<State & Action>()(set => ({
  setLegalUrls: (platform, urls) => set(state => ({ urls: { ...state.urls, [platform]: urls } })),
  urls: {},
}));

export const usePlatformLegalUrls = (platform?: Platform['name']) =>
  usePlatformLegalUrlsStore(s => (platform ? s.urls[platform] : undefined));

export const getPlatformLegalUrls = (platform?: Platform['name']) =>
  platform ? usePlatformLegalUrlsStore.getState().urls[platform] : undefined;
