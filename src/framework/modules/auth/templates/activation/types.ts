import { ModuleScreenProps } from '~/app/navigation/types';
import { IActivationPayload as ActivationPayload, LegalUrls, PlatformAuthContext } from '~/framework/modules/auth/model';
import { activateAccountActionAddFirstAccount } from '~/framework/modules/auth/thunks';

export type IFields = 'login' | 'password' | 'confirmPassword' | 'phone' | 'mail';
export type MobileState = 'MOBILE_FORMAT_INVALID' | 'PRISTINE' | 'STALE';
export type EmailState = 'EMAIL_FORMAT_INVALID' | 'PRISTINE';

export interface AuthActivationScreenState extends ActivationPayload {
  typing: boolean;
  acceptCGU: boolean;
  error?: string;
  activationState: 'IDLE' | 'RUNNING' | 'DONE';
}

export interface AuthActivationScreenStoreProps {
  legalUrls?: LegalUrls;
  context?: PlatformAuthContext;
  validReactionTypes?: string[];
}

export interface AuthActivationScreenDispatchProps {
  trySubmit: (
    ...args: Parameters<typeof activateAccountActionAddFirstAccount>
  ) => ReturnType<ReturnType<typeof activateAccountActionAddFirstAccount>>;
}

export interface AuthActivationScreenProps
  extends AuthActivationScreenDispatchProps, AuthActivationScreenStoreProps, ModuleScreenProps<'auth/activation'> {}
