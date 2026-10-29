import { Alert } from 'react-native';

import { Temporal } from '@js-temporal/polyfill';

import { I18n } from '~/util/i18n';

import { mediaStorage } from './storage';

/**
 * Does the action, after telling the user about the privacy of the files it handles (download, share...): the alert is shown the first
 * time, then once a day. The action is done when the user dismisses it.
 */
export const showPrivacyAlert = (action: () => void) => {
  const today = Temporal.Now.plainDateISO();
  const lastShown = mediaStorage.getString('privacyAlertDate');
  let isDue: boolean;
  try {
    isDue = !lastShown || Temporal.PlainDate.compare(today, Temporal.PlainDate.from(lastShown)) > 0;
  } catch {
    // A date that can't be read is the same as none.
    isDue = true;
  }
  if (!isDue) {
    action();
    return;
  }
  mediaStorage.set('privacyAlertDate', today.toString());
  Alert.alert(I18n.get('carousel-privacy-title'), I18n.get('carousel-privacy-text'), [
    { onPress: action, text: I18n.get('carousel-privacy-button') },
  ]);
};
