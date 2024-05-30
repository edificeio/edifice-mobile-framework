import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { activateAccountActionAddFirstAccount } from '~/framework/modules/auth/actions';
import {
  IActivationPayload as ActivationPayload,
  AuthCredentials,
  LegalUrls,
  PlatformAuthContext,
} from '~/framework/modules/auth/model';
import { AuthNavigationParams, authRouteNames } from '~/framework/modules/auth/navigation';
import { Platform } from '~/framework/util/appConf';

export type IFields = 'login' | 'password' | 'confirmPassword' | 'phone' | 'mail';

export interface ActivationScreenNavParams {
  platform: Platform;
  credentials: AuthCredentials;
}

export interface ActivationScreenState extends ActivationPayload {
  typing: boolean;
  acceptCGU: boolean;
  error?: string;
  activationState: 'IDLE' | 'RUNNING' | 'DONE';
}
export interface ActivationPrivateProps {}
export interface ActivationScreenStoreProps {
  legalUrls?: LegalUrls;
  context?: PlatformAuthContext;
  validReactionTypes?: string[];
}
export interface ActivationScreenDispatchProps {
  trySubmit: (
    ...args: Parameters<typeof activateAccountActionAddFirstAccount>
  ) => ReturnType<ReturnType<typeof activateAccountActionAddFirstAccount>>;
}
export type ActivationScreenProps = ActivationPrivateProps &
  ActivationScreenDispatchProps &
  ActivationScreenStoreProps &
  NativeStackScreenProps<AuthNavigationParams, typeof authRouteNames.activation | typeof authRouteNames.addAccountActivation>;
