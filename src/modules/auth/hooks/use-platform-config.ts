import React from 'react';

import appConf from '~/framework/util/appConf';
import { platformConfig } from '~/modules/auth/service';
import { usePlatformContextStore } from '~/modules/auth/store/platform-context';
import { usePlatformLegalUrlsStore } from '~/modules/auth/store/platform-legal-urls';

/**
 * Remote config of a platform that auth screens may need before any account is signed in.
 * Each one is fetched once, then kept in its store.
 */
export const loadPlatformContext = async (platformName: string) => {
  const store = usePlatformContextStore.getState();
  const cached = store.contexts[platformName];
  if (cached) return cached;
  const context = await platformConfig.context(appConf.assertPlatformOfName(platformName));
  if (context) store.setContext(platformName, context);
  return context;
};

export const loadPlatformLegalUrls = async (platformName: string) => {
  const store = usePlatformLegalUrlsStore.getState();
  const cached = store.urls[platformName];
  if (cached) return cached;
  const urls = await platformConfig.authI18n(appConf.assertPlatformOfName(platformName));
  if (urls) store.setLegalUrls(platformName, urls);
  return urls;
};

/**
 * The auth context of the platform (password rules...): `undefined` until loaded.
 * It is loaded if not already known.
 */
export const usePlatformAuthContext = (platformName: string) => {
  const context = usePlatformContextStore(s => s.contexts[platformName]);
  React.useEffect(() => {
    if (!context) loadPlatformContext(platformName).catch(e => console.error('[Auth] Unable to load platform context:', e));
  }, [context, platformName]);
  return context;
};

/**
 * The legal urls of the platform: `undefined` until loaded.
 * They are loaded if not already known.
 */
export const usePlatformAuthLegalUrls = (platformName: string) => {
  const urls = usePlatformLegalUrlsStore(s => s.urls[platformName]);
  React.useEffect(() => {
    if (!urls) loadPlatformLegalUrls(platformName).catch(e => console.error('[Auth] Unable to load platform legal urls:', e));
  }, [urls, platformName]);
  return urls;
};
