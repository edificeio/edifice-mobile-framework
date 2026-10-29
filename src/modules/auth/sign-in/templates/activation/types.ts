import type { Platform } from '~/framework/util/appConf';
import type { IActivationPayload, LegalUrls, PlatformAuthContext } from '~/modules/auth/model';

export type IFields = 'login' | 'password' | 'confirmPassword' | 'phone' | 'mail';
export type MobileState = 'MOBILE_FORMAT_INVALID' | 'PRISTINE' | 'STALE';
export type EmailState = 'EMAIL_FORMAT_INVALID' | 'PRISTINE';

export interface SignInActivationScreenTemplateState extends IActivationPayload {
  typing: boolean;
  acceptCGU: boolean;
  error?: string;
  activationState: 'IDLE' | 'RUNNING' | 'DONE';
}

export interface SignInActivationScreenTemplateProps {
  /** Login and activation code, given by the user to sign in. */
  credentials: { username: string; password: string };
  /** Name of the platform to activate the account on. */
  platform: Platform['name'];
  /** Opens a legal document (a pdf). */
  onOpenLegalUrl: (title: string, url: string) => void;
  /** Activates the account, then signs in. Throws an activation error. */
  trySubmit: (platform: Platform['name'], model: IActivationPayload) => Promise<void>;
}

export interface SignInActivationScreenTemplateLoadedProps extends SignInActivationScreenTemplateProps {
  context: PlatformAuthContext;
  legalUrls: LegalUrls;
}
