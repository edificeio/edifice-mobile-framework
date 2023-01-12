import { Platform } from '~/framework/util/appConf';
import { IEntcoreApp, IEntcoreWidget } from '~/framework/util/moduleTool';
import { OAuth2ErrorCode, OAuth2RessourceOwnerPasswordClient } from '~/infra/oauth';

export interface IUserAuthorizedAction {
  name: string;
  displayName: string;
  type: 'SECURED_ACTION_WORKFLOW'; // ToDo : add other types here
}

export interface IUser {
  id: string;
  login: string;
}

export interface ILoggedUser extends IUser {}

export interface ISession {
  platform: Platform;
  oauth2: OAuth2RessourceOwnerPasswordClient;
  apps: IEntcoreApp[];
  widgets: IEntcoreWidget[];
  authorizedActions: IUserAuthorizedAction[];
  user: ILoggedUser;
}

/** Error codes as an enum, values can be string that backend returns */
export enum RuntimeAuthErrorCode {
  RUNTIME_ERROR = 'runtime_error',
  RESTORE_FAIL = 'restore-fail',
  USERINFO_FAIL = 'userinfo-fail',
  USERPUBLICINFO_FAIL = 'userpublicinfo-fail',
  FIREBASE_ERROR = 'firebase_error',
  NOT_PREMIUM = 'not_premium',
  PRE_DELETED = 'pre_deleted',
  PLATFORM_NOT_EXISTS = 'platform-not-exists',
  ACTIVATION_ERROR = 'activation-error',
  UNKNOWN_ERROR = 'unknown-error',
  LOAD_I18N_ERROR = 'load-i18n-error',
}
export type AuthErrorCode = OAuth2ErrorCode | RuntimeAuthErrorCode;

export interface AuthErrorDetails {
  type: AuthErrorCode;
  error?: string;
  description?: string;
}
export type AuthError = Error & AuthErrorDetails;

export function createAuthError<T extends object>(
  type: AuthErrorCode,
  error: string,
  description?: string,
  additionalData?: T,
): AuthError & T {
  const err: AuthError = new Error('AUTH: returned error') as any;
  err.name = 'EAUTH';
  err.type = type;
  err.error = error;
  err.description = description;
  return { ...err, ...additionalData } as AuthError & T;
}

export enum PartialSessionScenario {
  MUST_CHANGE_PASSWORD = 'must-change-password',
  MUST_REVALIDATE_TERMS = 'must-revalidate-terms',
}

export interface IAuthContext {
  cgu: boolean;
  passwordRegex: string;
  passwordRegexI18n?: { [lang: string]: string };
  mandatory?: {
    mail?: boolean;
    phone?: boolean;
  };
}

export interface IActivationPayload {
  activationCode: string;
  login: string;
  password: string;
  confirmPassword: string;
  mail: string;
  phone: string;
  acceptCGU: boolean;
}

export interface IActivationError extends Error {
  name: 'EACTIVATION';
  type: string;
  error: string;
  description?: string;
}

export function createActivationError<T extends object>(
  type: string,
  error: string,
  description?: string,
  additionalData?: T,
): IActivationError & T {
  const err: IActivationError = new Error('ACTIVATION: returned error') as any;
  err.name = 'EACTIVATION';
  err.type = type;
  err.error = error;
  err.description = description;
  return { ...err, ...additionalData } as IActivationError & T;
}

export interface IAuthCredentials {
  username: string;
  password: string;
}

export type ForgotMode = 'id' | 'password';

export interface IForgotPayload {
  login: string;
  firstName?: string;
  structureId?: string;
}

export interface IChangePasswordPayload {
  login: string;
  oldPassword: string;
  newPassword: string;
  confirm: string;
}

export interface IChangePasswordError extends Error {
  name: 'ECHANGEPWD';
  type: string;
  error: string;
  description?: string;
}

export function createChangePasswordError<T extends object>(
  type: string,
  error: string,
  description?: string,
  additionalData?: T,
): IChangePasswordError & T {
  const err: IChangePasswordError = new Error('CHANGE PWD: returned error') as any;
  err.name = 'ECHANGEPWD';
  err.type = type;
  err.error = error;
  err.description = description;
  return { ...err, ...additionalData } as IChangePasswordError & T;
}

export type LegalUrls = {
  userCharter?: string;
  cgu?: string;
  personalDataProtection?: string;
  cookies?: string;
};
