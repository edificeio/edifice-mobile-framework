/**
 * Custom handler for React Native Linking API
 * Handle auto-login feature + alert confirmation
 */
import { Alert, Linking } from 'react-native';

import { CommonActions } from '@react-navigation/native';
import { decode } from 'html-entities';
import { Action } from 'redux';
import { ThunkDispatch } from 'redux-thunk';

import { I18n } from '~/app/i18n';
import { getStore, IGlobalState } from '~/app/store';
import { refreshQueryParamTokenAction } from '~/framework/modules/auth/actions';
import { getSession } from '~/framework/modules/auth/redux/reducer';
import { nabookRouteNames } from '~/framework/modules/nabook/navigation/';
import { handleNotificationNavigationAction } from '~/framework/util/notifications/routing';

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
  _url: string,
  customLabels?: OpenUrlCustomLabels,
  generateException?: boolean,
  showConfirmation: boolean = true,
  autoLogin: boolean = true,
): Promise<void> {
  try {
    let url = decode(_url);
    const session = getSession();
    // Note: openUrl must work also with relative urls.
    // This is NOT a good practice. Developer should use platformURISource or sessionURISource instead.
    if (session && url.startsWith('/')) {
      url = new URL(url, session.platform.url).href;
    }
    const urlOrigin = new URL(url).origin;
    const dispatch = getStore().dispatch as ThunkDispatch<IGlobalState, never, Action>;
    const isUrlInternal = session && urlOrigin === session.platform.url;

    // Special case for nabook: Do not redirect to responsive but open nabook module
    try {
      if (isUrlInternal && url.endsWith('nabook')) {
        handleNotificationNavigationAction(CommonActions.navigate({ name: nabookRouteNames.home }));
        return;
      }
    } catch (error) {
      console.error('Error navigating to nabook home:', error);
    }

    if (autoLogin && isUrlInternal) {
      try {
        const queryParamToken = await dispatch(refreshQueryParamTokenAction(session));
        if (queryParamToken && url) {
          const urlObj = new URL(url);
          urlObj.searchParams.append('queryparam_token', queryParamToken.value);
          url = urlObj.href;
        }
      } catch (e) {
        console.error('Error getting query param token: ', e);
      }
    }

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
            onPress: () => verifyAndOpenUrl(url),
            style: 'default',
            text: customLabels?.continue ?? I18n.get('common-continue'),
          },
        ],
        {
          cancelable: true,
        },
      );
    } else verifyAndOpenUrl(url);
  } catch (e) {
    const title = customLabels?.errorTitle ?? customLabels?.error ?? I18n.get('linking-redirectbrowser-error');
    const message = customLabels?.error ?? (title ? undefined : I18n.get('linking-redirectbrowser-error'));
    Alert.alert(title, message);
    if (generateException) throw e;
  }
}
