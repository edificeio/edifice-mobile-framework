import ToastMessage, { ToastShowParams } from 'react-native-toast-message';

import { I18n } from '~/app/i18n';
import Feedback from '~/framework/util/feedback/feedback';

import { DEFAULTS } from './component';
import { ToastOptions } from './types';

export { ToastHandler, RootToastHandler } from './component';

function showToastGeneric(type: string, text: string, options: ToastOptions & ToastShowParams = {}) {
  ToastMessage.show({
    type,
    text1: text,
    text2: options.label,
    position: 'top',
    visibilityTime: options.visibilityTime,
    autoHide: options.autoHide,
    props: {
      toastId: Math.random(),
      picture: options.icon,
      duration: options.autoHide ? options.visibilityTime : 0,
      onLabelPress: options.onLabelPress,
    },
  });
}

function showToast(type: string, text: string, options: ToastOptions = {}) {
  showToastGeneric(type, text, { ...options, visibilityTime: options.duration ?? DEFAULTS.visibilityTime, autoHide: true });
}

export const showError = (text: string = I18n.get('common.error.text'), options?: ToastOptions) => {
  showToast('error', text, options);
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

function showToastPermanent(type: string, text: string, options: ToastOptions = {}) {
  showToastGeneric(type, text, { ...options, autoHide: false });
}

export const showErrorPermanent = (text: string = I18n.get('common.error.text'), options?: ToastOptions) => {
  showToastPermanent('error', text, options);
  Feedback.errorDisplayed();
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
  showSuccess,
  showWarning,
  showErrorPermanent,
  showInfoPermanent,
  showSuccessPermanent,
  showWarningPermanent,
};
