import ToastMessage, { ToastShowParams } from 'react-native-toast-message';

import { DEFAULTS } from './component';
import { ToastOptions } from './types';

import { I18n } from '~/app/i18n';
import Feedback from '~/framework/util/feedback/feedback';

export { RootToastHandler, ToastHandler } from './component';

function showToastGeneric(type: string, text: string, options: ToastOptions & ToastShowParams = {}) {
  ToastMessage.show({
    autoHide: options.autoHide,
    position: 'top',
    props: {
      duration: options.autoHide ? options.visibilityTime : 0,
      onLabelPress: options.onLabelPress,
      picture: options.icon,
      testID: options.testID,
      toastId: Math.random(),
    },
    text1: text,
    text2: options.label,
    type,
    visibilityTime: options.visibilityTime,
  });
}

function showToast(type: string, text: string, options: ToastOptions = {}) {
  showToastGeneric(type, text, { ...options, autoHide: true, visibilityTime: options.duration ?? DEFAULTS.visibilityTime });
}

function showToastPermanent(type: string, text: string, options: ToastOptions = {}) {
  showToastGeneric(type, text, { ...options, autoHide: false });
}

export const showError = (text: string = I18n.get('toast-error-text'), options?: ToastOptions) => {
  showToastPermanent('error', text, options);
  Feedback.errorDisplayed();
};

export const showInfo = (text: string, options?: ToastOptions) => {
  showToast('info', text, options);
};

export const showSuccess = (text: string, options?: ToastOptions) => {
  showToast('success', text, options);
};

export const showWarning = (text: string, options?: ToastOptions) => {
  showToast('warning', text, options);
  Feedback.warningDisplayed();
};

export const showInfoPermanent = (text: string, options?: ToastOptions) => {
  showToastPermanent('info', text, options);
};

export const showSuccessPermanent = (text: string, options?: ToastOptions) => {
  showToastPermanent('success', text, options);
};

export const showWarningPermanent = (text: string, options?: ToastOptions) => {
  showToastPermanent('warning', text, options);
  Feedback.warningDisplayed();
};

export default {
  showError,
  showInfo,
  showInfoPermanent,
  showSuccess,
  showSuccessPermanent,
  showWarning,
  showWarningPermanent,
};
