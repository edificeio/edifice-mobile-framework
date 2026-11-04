/**
 * Opens urls outside of the app (browser, other apps), with a confirmation and the auto-login on the platform of the connected account.
 */
import { Alert, Linking } from 'react-native';

import { CommonActions } from '@react-navigation/native';
import { decode } from 'html-entities';

import { navigationRef } from '~/app/navigation';
import Toast from '~/framework/components/toast';
import { nabookRouteNames } from '~/framework/modules/nabook/navigation/';
import appConf from '~/framework/util/appConf';
import { handleNotificationNavigationAction } from '~/framework/util/notifications/routing';
import { refreshQueryParamToken } from '~/modules/auth/flows/refresh-query-param-token';
import { getActiveAccount } from '~/modules/auth/store/accounts';
import { I18n } from '~/util/i18n';

import type { OpenUrlAsyncOptions, OpenUrlConfirmation, OpenUrlOptions } from './types';

export type { OpenUrlAsyncOptions, OpenUrlConfirmation, OpenUrlOptions };

/** Asks the user to confirm. Resolves `true` if they did, `false` if they cancelled or dismissed the alert. */
const confirm = (confirmation: OpenUrlConfirmation) =>
  new Promise<boolean>(resolve => {
    Alert.alert(
      confirmation.title ?? I18n.get('linking-redirectbrowser-title'),
      confirmation.message ?? I18n.get('linking-redirectbrowser-message'),
      [
        { onPress: () => resolve(false), style: 'cancel', text: confirmation.cancel ?? I18n.get('common-cancel') },
        { onPress: () => resolve(true), style: 'default', text: confirmation.continue ?? I18n.get('common-continue') },
      ],
      { cancelable: true, ...confirmation.options, onDismiss: () => resolve(false) },
    );
  });

/**
 * Opens the url outside of the app, after a confirmation (unless `confirmation` is `false`).
 *
 * - An url without domain (`/workspace/document/123`) is the one of the platform of the connected account.
 * - An url of the platform of the connected account (same origin) is open logged in: a query param token is added. If the token can't be
 *   obtained, the url is open anyway, without it.
 *
 * Resolves `true` if the url is open, `false` if the user cancelled. Rejects if the url can't be open: use `openUrl` to
 * have the error shown to the user.
 */
export async function openUrlAsync(_url: string, { confirmation = {} }: OpenUrlAsyncOptions = {}): Promise<boolean> {
  let url = normalizeYoutubeUrl(decode(_url));

  // The account is only needed for the urls of its platform (relative ones included), so nothing is required for the other urls.
  const account = getActiveAccount();
  const platform = account ? appConf.getExpandedPlatform(account.platform) : undefined;
  if (url.startsWith('/')) {
    if (!platform) throw new Error(`[openUrl] no platform to resolve the relative url ${url}`);
    url = new URL(url, platform.url).href;
  }
  // Throws if the url is not valid. Same origin, not just the same beginning: `https://ent.fr.evil.com` starts like `https://ent.fr`.
  const { origin } = new URL(url);
  const isUrlInternal = !!platform && origin === new URL(platform.url).origin;

  // Special case for nabook: do not redirect to responsive but open nabook module
  if (isUrlInternal && url.endsWith('nabook')) {
    handleNotificationNavigationAction(
      // ToDo: make handleNotificationNavigationAction (navigate with preventBack handling) framework) friendly.
      CommonActions.navigate({ name: nabookRouteNames.home }),
      navigationRef,
      navigationRef.dispatch,
    );
    return true;
  }

  if (confirmation && !(await confirm(confirmation))) return false;

  if (account && isUrlInternal) {
    try {
      const queryParamToken = await refreshQueryParamToken(account);
      const urlObj = new URL(url);
      urlObj.searchParams.append('queryparam_token', queryParamToken.value);
      url = urlObj.href;
    } catch (e) {
      console.warn('[openUrl] - unable to get the query param token, the url is open without it: ', e);
    }
  }

  console.debug(`[openUrl] - open ${url}`);
  await Linking.openURL(url);
  return true;
}

/**
 * Same as `openUrlAsync`, for the callers that don't wait for it: shows an error toast if the url can't be open, and tells how it went
 * through the callbacks.
 */
export function openUrl(url: string, { errorText, onCancel, onError, onSuccess, ...options }: OpenUrlOptions = {}): void {
  openUrlAsync(url, options).then(
    opened => (opened ? onSuccess : onCancel)?.(),
    e => {
      console.error(`[openUrl] - unable to open ${url}: `, e);
      Toast.showError(errorText ?? I18n.get('linking-redirectbrowser-error'));
      onError?.(e);
    },
  );
}

const normalizeYoutubeUrl = (url: string) => {
  try {
    const urlObj = new URL(url);

    const hostname = urlObj.hostname.toLowerCase();
    const isYoutubeDomain = hostname.includes('youtube.com') || hostname.includes('youtu.be');

    if (!isYoutubeDomain) {
      return url;
    }

    // Extract video ID (/embed/BLvzDXtn-bo)
    const videoId = urlObj.pathname.split('/embed/')[1];
    if (!videoId) return url;

    // Extract timestamp if provided
    const startTime = urlObj.searchParams.get('start') || urlObj.searchParams.get('t');

    // Build watch url
    const watchUrl = new URL(`https://www.youtube.com/watch?v=${videoId}`);
    if (startTime) {
      watchUrl.searchParams.append('start', startTime);
    }

    return watchUrl.toString();
  } catch {
    return url;
  }
};
