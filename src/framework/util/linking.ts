/**
 * Custom handler for React Native Linking API
 * Handle auto-login feature + alert confirmation
 */
import I18n from 'i18n-js';
import { Alert, Linking } from 'react-native';

import { urlSigner } from '~/infra/oauth';

import { IUserSession, getUserSession } from './session';

export interface OpenUrlCustomLabels {
  title?: string;
  message?: string;
  continue?: string;
  cancel?: string;
  error?: string;
}

export async function openUrl(
  urlOrGetUrl?: string | ((session: IUserSession) => string | false | undefined | Promise<string | false | undefined>),
  customLabels?: OpenUrlCustomLabels,
  generateException?: boolean,
  showConfirmation: boolean = true,
  autoLogin: boolean = true,
): Promise<void> {
  try {
    const session = getUserSession();
    if (autoLogin && !session) {
      throw new Error('openUrl : no active session.');
    }
    // 1. compute url redirection if function provided
    if (!urlOrGetUrl) {
      throw new Error('openUrl : no url provided.');
    }
    let url = typeof urlOrGetUrl === 'string' ? urlOrGetUrl : await urlOrGetUrl(session);
    if (!url) {
      throw new Error('openUrl : no url provided.');
    }
    // 1. compute url redirection if function provided
    url = urlSigner.getAbsoluteUrl(url);
    try {
      if (urlSigner.getIsUrlSignable(url) && autoLogin) {
        const customToken = await session.oauth.getQueryParamToken();
        if (customToken) {
          // Token can have failed to load. In that case, just ignore it and go on. The user may need to login on the web.
          const urlObj = new URL(url);
          urlObj.searchParams.append('queryparam_token', customToken);
          url = urlObj.href;
        }
      }
    } catch (e) {
      // DO nothing. We just don't have customToken.
    }
    const finalUrl: string = url;
    // 2. Show confirmation or open url directly
    const verifyAndOpenUrl = async () => {
      const isSupported = await Linking.canOpenURL(finalUrl);
      if (isSupported === true) {
        await Linking.openURL(finalUrl);
      } else {
        throw new Error('openUrl : url provided is not supported');
      }
    };
    if (showConfirmation) {
      Alert.alert(
        customLabels?.title ?? I18n.t('common.redirect.browser.title'),
        customLabels?.message ?? I18n.t('common.redirect.browser.message'),
        [
          {
            text: customLabels?.cancel ?? I18n.t('common.cancel'),
            style: 'cancel',
          },
          {
            text: customLabels?.continue ?? I18n.t('common.continue'),
            onPress: () => verifyAndOpenUrl(),
            style: 'default',
          },
        ],
        {
          cancelable: true,
        },
      );
    } else verifyAndOpenUrl();
  } catch (e) {
    Alert.alert(customLabels?.error ?? I18n.t('common.redirect.browser.error'));
    if (generateException) throw e;
  }
}
