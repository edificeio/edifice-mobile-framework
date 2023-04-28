import I18n from 'i18n-js';
import ToastMessage from 'react-native-toast-message';

import Feedback from '~/framework/util/feedback/feedback';

const TOAST_VISIBILITY_TIME = 3000;

export default class Toast {
  private static showToast(type: string, text: string) {
    ToastMessage.show({
      type,
      text1: text,
      position: 'top',
      topOffset: 8,
      visibilityTime: TOAST_VISIBILITY_TIME,
    });
  }

  static showError(text: string = I18n.t('common.error.text')) {
    this.showToast('error', text);
    Feedback.errorDisplayed();
    e;
  }

  static showInfo(text: string) {
    this.showToast('info', text);
  }

  static showSuccess(text: string) {
    this.showToast('success', text);
  }
}
