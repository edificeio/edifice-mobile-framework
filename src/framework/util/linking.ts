/**
 * Custom handler for React Native Linking API
 */

import I18n from 'i18n-js';
import { Linking } from 'react-native';
import Toast from 'react-native-tiny-toast';

export const openUrl = (url: string) =>
  Linking.canOpenURL(url).then(supported => {
    if (supported) Linking.openURL(url);
    else {
      console.warn('[Linking] Url not supported: ', url);
      Toast.show(I18n.t('common.error.text'));
    }
  });
