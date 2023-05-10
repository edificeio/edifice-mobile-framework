import I18n from 'i18n-js';
import ToastMessage, { ToastShowParams } from 'react-native-toast-message';

import Feedback from '~/framework/util/feedback/feedback';

import { UI_SIZES } from '../constants';

const TOAST_VISIBILITY_TIME = 3000;

const TOAST_MARGIN = UI_SIZES.spacing.minor;

export default class Toast {
  private static showToast(type: string, text: string, options: ToastShowParams = {}) {
    const { topOffset = 0, ...otherOpts } = options;
    ToastMessage.show({
      type,
      text1: text,
      position: 'top',
      topOffset: TOAST_MARGIN + UI_SIZES.elements.navbarHeight + UI_SIZES.screen.topInset + topOffset,
      visibilityTime: TOAST_VISIBILITY_TIME,
      ...otherOpts,
    });
  }

  static showError(text: string = I18n.t('common.error.text'), options?: ToastShowParams) {
    this.showToast('error', text, options);
    Feedback.errorDisplayed();
  }

  static showInfo(text: string, options?: ToastShowParams) {
    this.showToast('info', text, options);
  }

  static showSuccess(text: string, options?: ToastShowParams) {
    this.showToast('success', text, options);
  }
}
