import { useRoute } from '@react-navigation/native';
import I18n from 'i18n-js';
import * as React from 'react';
import ToastMessage, { ToastProps, ToastShowParams } from 'react-native-toast-message';

import { isModalModeOnThisRoute } from '~/framework/navigation/hideTabBarAndroid';
import Feedback from '~/framework/util/feedback/feedback';

import { UI_SIZES } from '../constants';

const TOAST_VISIBILITY_TIME = 3000;

export const TOAST_MARGIN = UI_SIZES.spacing.minor;

function showToast(type: string, text: string, options: ToastShowParams = {}) {
  ToastMessage.show({
    type,
    text1: text,
    position: 'top',
    visibilityTime: TOAST_VISIBILITY_TIME,
    ...options,
  });
}

export function ScreenToast(props: ToastProps) {
  const route = useRoute();
  const isModal = isModalModeOnThisRoute(route.name);
  const topOffset = isModal
    ? TOAST_MARGIN
    : TOAST_MARGIN + UI_SIZES.elements.navbarHeight + UI_SIZES.elements.statusbarHeight + UI_SIZES.screen.topInset;
  return <ToastMessage topOffset={topOffset} {...props} />;
}

export default function Toast(props: ToastProps) {
  return (
    <ToastMessage
      topOffset={TOAST_MARGIN + UI_SIZES.elements.navbarHeight + (UI_SIZES.screen.topInset || UI_SIZES.elements.statusbarHeight)}
      {...props}
    />
  );
}
Toast.showError = (text: string = I18n.t('common.error.text'), options?: ToastShowParams) => {
  showToast('error', text, options);
  Feedback.errorDisplayed();
};
Toast.showInfo = (text: string, options?: ToastShowParams) => {
  showToast('info', text, options);
};
Toast.showSuccess = (text: string, options?: ToastShowParams) => {
  showToast('success', text, options);
};
