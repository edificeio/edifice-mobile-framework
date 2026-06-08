import * as React from 'react';

import { NavigationIndependentTree, useNavigationContainerRef } from '@react-navigation/native';
import { useSelector } from 'react-redux';

import { I18n } from '~/app/i18n';
import { NavigationContainer, navigationRef as parentNavigationRef } from '~/app/navigation';
import { createLeafStackNavigator } from '~/app/navigation/leaf-stack';
import { modalScreenOptions } from '~/app/navigation/util';
import { getAuthReduxNavigationStateForNewAccount } from '~/framework/modules/auth/new-navigation';
import { getState } from '~/framework/modules/auth/redux/reducer';

import AuthActivationAddAccountScreen, { computeNavBar as authActivationAddAccountNavBar } from '../add-account/activation';
import AuthForgotAddAccountScreen from '../add-account/forgot';
import AuthLoginCredentialsScreen, { computeNavBar as loginCredentialsNavBar } from '../add-account/login-credentials';
import AuthLoginRedirectAddAccountScreen, { computeNavBar as loginRedirectNavBar } from '../add-account/login-redirect';
import AuthLoginWayfAddAccountScreen, { computeNavBar as loginWayfNavBar } from '../add-account/login-wayf';
import AuthOnboardingAddAccountScreen, { computeNavBar as AuthOnboardingAddAccountScreenOptions } from '../add-account/onboarding';
import AuthPlatformsAddAccountScreen, { computeNavBar as platformsAddAccountNavBar } from '../add-account/platforms';
import { AuthRenewPasswordScreen, AuthRenewPasswordScreenOptions } from '../add-account/renew-password';
import AuthWayfAddAccountScreen, { computeNavBar as wayfNavBar } from '../add-account/wayf';

export const computeNavBar = modalScreenOptions('modal', () => ({ title: I18n.get('auth-add-account-modal-title') }));

const LeafStack = createLeafStackNavigator();

export default function AuthAddAccountModalScreen() {
  const pending = useSelector(state => getState(state).pendingAddAccount);
  const navigationState = React.useMemo(() => getAuthReduxNavigationStateForNewAccount({ pending }), [pending]);
  const navigationRef = useNavigationContainerRef();
  const navigationKey = React.useMemo(() => JSON.stringify(navigationState), [navigationState]);
  const initialNavigationDone = React.useRef(false);
  React.useEffect(() => {
    __DEV__ && console.info('[Navigation] Auth nav key changed ', navigationKey);
    initialNavigationDone.current && navigationRef.isReady() && navigationState && navigationRef.reset(navigationState);
    initialNavigationDone.current = true;
    // Do not depend on `navigationState` since it can be recreated when session updates while being logged in
  }, [navigationKey, navigationRef]);
  return (
    <NavigationIndependentTree>
      <NavigationContainer
        // NO initial state since we WANT to start always on boarding
        ref={navigationRef}
        onUnhandledAction={action => {
          parentNavigationRef.dispatch(action);
        }}>
        <LeafStack.Navigator screenOptions={{ headerShown: false }}>
          <LeafStack.Screen
            name="auth/add-account/onboarding"
            component={AuthOnboardingAddAccountScreen}
            options={AuthOnboardingAddAccountScreenOptions}
          />
          <LeafStack.Screen
            name="auth/add-account/platforms"
            component={AuthPlatformsAddAccountScreen}
            options={platformsAddAccountNavBar}
          />
          <LeafStack.Screen
            name="auth/add-account/login/credentials"
            component={AuthLoginCredentialsScreen}
            options={loginCredentialsNavBar}
          />

          <LeafStack.Screen
            name="auth/add-account/login/wayf"
            component={AuthLoginWayfAddAccountScreen}
            options={loginWayfNavBar}
          />
          <LeafStack.Screen
            name="auth/add-account/login/redirect"
            component={AuthLoginRedirectAddAccountScreen}
            options={loginRedirectNavBar}
          />
          <LeafStack.Screen name="auth/add-account/wayf" component={AuthWayfAddAccountScreen} options={wayfNavBar} />

          <LeafStack.Screen
            name="auth/add-account/activation"
            component={AuthActivationAddAccountScreen}
            options={authActivationAddAccountNavBar}
          />
          <LeafStack.Screen
            name="auth/add-account/renew-password"
            component={AuthRenewPasswordScreen}
            options={AuthRenewPasswordScreenOptions}
          />
          <LeafStack.Screen
            name="auth/add-account/forgot"
            component={AuthForgotAddAccountScreen}
            options={({ route }) => ({
              title:
                route.params.mode === 'id' ? I18n.get('auth-navigation-forgot-id') : I18n.get('auth-navigation-forgot-password'),
            })}
          />
        </LeafStack.Navigator>
      </NavigationContainer>
    </NavigationIndependentTree>
  );
}
