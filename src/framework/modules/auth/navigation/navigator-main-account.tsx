/**
 * Navigator for the auth section
 */
import * as React from 'react';

import { I18n } from '~/app/i18n';
import ActivationScreen from '~/framework/modules/auth/screens/ActivationScreen';
import ForgotScreen from '~/framework/modules/auth/screens/ForgotScreen';
import LoginWayfScreen from '~/framework/modules/auth/screens/LoginWayfScreen';
import PlatformSelectScreen from '~/framework/modules/auth/screens/PlatformSelectScreen';
import RevalidateTermsScreen from '~/framework/modules/auth/screens/RevalidateTermsScreen';
import WayfScreen from '~/framework/modules/auth/screens/WayfScreen';
import AuthAccountSelectionScreen, {
  computeNavBar as authAccountSelectionNavBar,
} from '~/framework/modules/auth/screens/account-selection';
import AuthAddAccountModalScreen, {
  computeNavBar as addAccountModalNavBar,
} from '~/framework/modules/auth/screens/add-account-modal';
import AuthChangeEmailScreen, { computeNavBar as authChangeEmailNavBar } from '~/framework/modules/auth/screens/change-email';
import AuthChangeMobileScreen, { computeNavBar as authChangeMobileNavBar } from '~/framework/modules/auth/screens/change-mobile';
import ChangePasswordScreenOLD from '~/framework/modules/auth/screens/change-password';
import LoginCredentialsScreen, {
  computeNavBar as authLoginCredentialsNavBar,
} from '~/framework/modules/auth/screens/login-credentials';
import AuthMFAScreen, { computeNavBar as mfaNavBar } from '~/framework/modules/auth/screens/mfa';
import AuthOnboardingScreen, { computeNavBar as onboardingNavBar } from '~/framework/modules/auth/screens/onboarding';
import { setModalModeForRoutes } from '~/framework/navigation/hideTabBarAndroid';
import { navBarOptions, navBarTitle } from '~/framework/navigation/navBar';
import { getTypedRootStack } from '~/framework/navigation/navigators';

import { AuthNavigationParams, authRouteNames } from '.';

const Stack = getTypedRootStack<AuthNavigationParams>();

// Auth Stack used when user is logged out, or managing the current logged account.

export default function () {
  return (
    <Stack.Group screenOptions={navBarOptions}>
      <Stack.Screen name={authRouteNames.onboarding} component={AuthOnboardingScreen} options={onboardingNavBar} />
      <Stack.Group screenOptions={{ headerShown: false }}>
        <Stack.Screen name={authRouteNames.platforms} component={PlatformSelectScreen} />
      </Stack.Group>
      <Stack.Screen
        name={authRouteNames.accountSelection}
        component={AuthAccountSelectionScreen}
        options={authAccountSelectionNavBar}
      />
      <Stack.Screen
        name={authRouteNames.loginCredentials}
        component={LoginCredentialsScreen}
        options={authLoginCredentialsNavBar}
      />
      <Stack.Screen
        name={authRouteNames.loginWayf}
        component={LoginWayfScreen}
        options={({ route }) => ({
          headerTitle: navBarTitle(route.params?.platform.displayName),
        })}
      />
      <Stack.Screen
        name={authRouteNames.wayf}
        component={WayfScreen}
        options={{
          headerTitle: navBarTitle(I18n.get('auth-wayf-main-title')),
        }}
      />
      <Stack.Screen
        name={authRouteNames.activation}
        component={ActivationScreen}
        options={{
          headerTitle: navBarTitle(I18n.get('auth-navigation-activation-title')),
        }}
      />
      <Stack.Screen
        name={authRouteNames.forgot}
        component={ForgotScreen}
        options={({ route }) => ({
          headerTitle: navBarTitle(
            route.params.mode === 'id' ? I18n.get('auth-navigation-forgot-id') : I18n.get('auth-navigation-forgot-password'),
          ),
        })}
      />
      <Stack.Screen
        name={authRouteNames.revalidateTerms}
        component={RevalidateTermsScreen}
        options={{
          headerTitle: navBarTitle(I18n.get('user-revalidateterms-title')),
        }}
      />
      <Stack.Screen
        name={authRouteNames.changePassword}
        component={ChangePasswordScreenOLD}
        options={{
          headerTitle: navBarTitle(I18n.get('user-page-editpassword')),
        }}
      />
      <Stack.Group screenOptions={{ presentation: 'fullScreenModal' }}>
        <Stack.Screen
          name={authRouteNames.changePasswordModal}
          component={ChangePasswordScreenOLD}
          options={{
            headerTitle: navBarTitle(I18n.get('user-page-editpassword')),
          }}
        />
      </Stack.Group>
      <Stack.Screen
        name={authRouteNames.changeEmail}
        component={AuthChangeEmailScreen}
        options={authChangeEmailNavBar}
        initialParams={{}}
      />
      <Stack.Screen
        name={authRouteNames.changeMobile}
        component={AuthChangeMobileScreen}
        options={authChangeMobileNavBar}
        initialParams={{}}
      />
      <Stack.Screen name={authRouteNames.mfa} component={AuthMFAScreen} options={mfaNavBar} initialParams={{}} />
      <Stack.Group screenOptions={{ presentation: 'fullScreenModal' }}>
        <Stack.Screen name={authRouteNames.mfaModal} component={AuthMFAScreen} options={mfaNavBar} initialParams={{}} />
        <Stack.Screen
          name={authRouteNames.addAccountModal}
          component={AuthAddAccountModalScreen}
          options={addAccountModalNavBar}
          initialParams={undefined}
        />
      </Stack.Group>
    </Stack.Group>
  );
}

setModalModeForRoutes([authRouteNames.changePasswordModal, authRouteNames.mfaModal, authRouteNames.addAccountModal]);
