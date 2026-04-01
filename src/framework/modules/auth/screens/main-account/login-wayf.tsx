import * as React from 'react';

import { CommonActions } from '@react-navigation/native';
import type { NativeStackNavigatorProps } from '@react-navigation/native-stack';

import AuthLoginWayfScreenTemplate from '../../templates/login-wayf/screen';

import { I18n } from '~/app/i18n';
import { authRouteNames } from '~/framework/modules/auth/navigation';
import { AuthLoginWayfScreenProps } from '~/framework/modules/auth/templates/login-wayf';

export default function AuthLoginWayfScreen(
  props: Omit<AuthLoginWayfScreenProps, 'wayfRoute' | 'handleConsumeError' | 'auth' | 'error'>,
) {
  return (
    <AuthLoginWayfScreenTemplate
      wayfRoute={CommonActions.navigate({
        name: authRouteNames.wayf,
        params: { accountId: props.route.params.accountId, platform: props.route.params.platform },
      })}
      {...props}
    />
  );
}
AuthLoginWayfScreen.options = { title: I18n.get('auth-wayf-main-title') } satisfies NativeStackNavigatorProps['screenOptions'];
