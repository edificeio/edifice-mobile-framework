/**
 * Custom handler for React Native Linking API
 * Handle auto-login feature + alert confirmation
 */
import { Alert, Linking } from 'react-native';

import { CommonActions } from '@react-navigation/native';
import { decode } from 'html-entities';

import { I18n } from '~/app/i18n';
import { getSession } from '~/framework/modules/auth/reducer';
import { nabookRouteNames } from '~/framework/modules/nabook/navigation/';
import { handleNotificationNavigationAction } from '~/framework/util/notifications/routing';
import { OAuth2RessourceOwnerPasswordClient, urlSigner } from '~/infra/oauth';

export interface OpenUrlCustomLabels {
  title?: string;
  message?: string;
  continue?: string;
  cancel?: string;
  error?: string;
  errorTitle?: string;
}

const verifyAndOpenUrl = async (finalUrl: string) => {
  try {
    await Linking.openURL(finalUrl);
  } catch {
    throw new Error('openUrl : url provided is not supported');
  }
};

export async function openUrl(
  url?: string,
  customLabels?: OpenUrlCustomLabels,
  generateException?: boolean,
  showConfirmation: boolean = true,
  autoLogin: boolean = true,
): Promise<void> {
  try {
    if (!url) {
      throw new Error('openUrl : no url provided.');
    }

    const session = getSession();

    // Special case for nabook: Do not redirect to responsive but open nabook module
    try {
      if (session && url.startsWith(session.platform.url) && url.endsWith('nabook')) {
        handleNotificationNavigationAction(CommonActions.navigate({ name: nabookRouteNames.home }));
        return;
      }
    } catch (error) {
      console.error('Error navigating to nabook home:', error);
    }

    let finalUrl = urlSigner.getAbsoluteUrl(decode(url));

    if (autoLogin) {
      try {
        if (urlSigner.getIsUrlSignable(finalUrl)) {
          const customToken = await OAuth2RessourceOwnerPasswordClient.connection?.getQueryParamToken();
          if (customToken && finalUrl) {
            // Token can have failed to load. In that case, just ignore it and go on. The user may need to login on the web.
            const urlObj = new URL(finalUrl);
            urlObj.searchParams.append('queryparam_token', customToken);
            finalUrl = urlObj.href;
          }
        }
      } catch (e) {
        console.error('Error getting query param token: ', e);
      }
    }

    console.info('Try to redirect to:', finalUrl);

    if (showConfirmation) {
      Alert.alert(
        customLabels?.title ?? I18n.get('linking-redirectbrowser-title'),
        customLabels?.message ?? I18n.get('linking-redirectbrowser-message'),
        [
          {
            style: 'cancel',
            text: customLabels?.cancel ?? I18n.get('common-cancel'),
          },
          {
            onPress: () => verifyAndOpenUrl(finalUrl!),
            style: 'default',
            text: customLabels?.continue ?? I18n.get('common-continue'),
          },
        ],
        {
          cancelable: true,
        },
      );
    } else verifyAndOpenUrl(finalUrl!);
  } catch (e) {
    const title = customLabels?.errorTitle ?? customLabels?.error ?? I18n.get('linking-redirectbrowser-error');
    const message = customLabels?.error ?? (title ? undefined : I18n.get('linking-redirectbrowser-error'));
    Alert.alert(title, message);
    if (generateException) throw e;
  }
}
