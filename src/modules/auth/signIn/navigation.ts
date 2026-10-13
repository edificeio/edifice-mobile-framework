import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import type { ModuleModals, ModuleScreens, NavigationParamsOfScreens } from '~/app/module';

import type signInModule from '.';

/**
 * Params of every route of the auth navigator (signIn screens + signIn modals), see `navigation-container.tsx`.
 */
type AuthParamList = NavigationParamsOfScreens<ModuleScreens<typeof signInModule>> &
  NavigationParamsOfScreens<ModuleModals<typeof signInModule>>;

export type SignInNavigation = NativeStackNavigationProp<AuthParamList, keyof AuthParamList>;

/**
 * Same as `useNavigation`, but typed with the screens of the auth navigator (signIn module) only.
 */
export const useSignInNavigation = () => {
  return useNavigation<SignInNavigation>();
};
