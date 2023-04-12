import I18n from 'i18n-js';
// eslint-disable-next-line import/no-extraneous-dependencies
import ToastMessage from 'react-native-toast-message';

export default class Toast {
  static $showToast(type: string, text: string) {
    ToastMessage.show({
      type,
      text1: text,
      position: 'bottom',
      bottomOffset: 30,
    });
  }

  static showSuccess(text: string) {
    this.$showToast('success', text);
  }

  static showError(text: string = I18n.t('common.error.text')) {
    this.$showToast('error', text);
  }

  static showInfo(text: string) {
    this.$showToast('info', text);
  }
}
