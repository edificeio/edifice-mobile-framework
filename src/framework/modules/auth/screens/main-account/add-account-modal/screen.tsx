import type { NativeStackNavigationOptions, NativeStackScreenProps } from '@react-navigation/native-stack';
import * as React from 'react';
import { useSelector } from 'react-redux';

import { I18n } from '~/app/i18n';
import { AuthNavigationParams, authRouteNames } from '~/framework/modules/auth/navigation';
import useAuthNavigation from '~/framework/modules/auth/navigation/add-account/navigator';
import { getAddAccountNavigationState } from '~/framework/modules/auth/navigation/add-account/router';
import { getState } from '~/framework/modules/auth/reducer';
import { navBarOptions } from '~/framework/navigation/navBar';
import { getTypedRootStack } from '~/framework/navigation/navigators';

import type { AuthAddAccountModalScreenPrivateProps } from './types';

export const computeNavBar = ({
  navigation,
  route,
}: NativeStackScreenProps<AuthNavigationParams, typeof authRouteNames.addAccountModal>): NativeStackNavigationOptions => ({
  ...navBarOptions({
    navigation,
    route,
    title: I18n.get('auth-add-account-modal-title'),
  }),
});

export default function AuthAddAccountModalScreen(props: AuthAddAccountModalScreenPrivateProps) {
  const RootStack = getTypedRootStack();
  const authNavigation = useAuthNavigation();
  const pending = useSelector(state => getState(state).pending);
  const navigationState = React.useMemo(() => getAddAccountNavigationState(pending), [pending]);
  return (
    <RootStack.Navigator
      initialRouteName={navigationState.routes[navigationState.routes.length - 1].name}
      screenOptions={{ headerShown: false }}>
      {authNavigation}
    </RootStack.Navigator>
  );
}
