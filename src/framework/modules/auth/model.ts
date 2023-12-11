import type { Moment } from 'moment';
import DeviceInfo from 'react-native-device-info';

import { I18n } from '~/app/i18n';
import { Platform } from '~/framework/util/appConf';
import { IEntcoreApp, IEntcoreWidget } from '~/framework/util/moduleTool';
import { OAuth2ErrorCode, OAuth2RessourceOwnerPasswordClient } from '~/infra/oauth';

import type { IAuthorizedAction, UserPrivateData } from './service';

/**
 * Every profile type for accounts. Each account is of one type only.
 * Parent teachers have two accounts, one for each type.
 */
export enum AccountTyoe {
  Student = 'Student',
  Relative = 'Relative',
  Teacher = 'Teacher',
  Personnel = 'Personnel',
  Guest = 'Guest',
}

/**
 * Describes minimal info to display a user
 */
export interface DisplayUserPublic {
  id: string; // id is used to get avatar
  displayName: string;
}

/**
 * Describes minimal info to display a user, but with account type hint
 */
export interface DisplayUserPublicWithType extends DisplayUserPublic {
  type: AccountTyoe;
}

/**
 * Represent user information that a seved account contains
 */
export interface AuthSavedAccountUserInfo extends DisplayUserPublicWithType {
  avatar?: Blob;
  loginUsed: string;
}

/**
 * Describes the contact information of a user
 */
export interface AuthUserContactDetails {
  email?: string;
  mobile?: string;
  homePhone?: string;
}

/**
 * Describes all visible values from logged user profile.
 */
export interface AuthLoggedUserProfile extends AuthSavedAccountUserInfo, AuthUserContactDetails {
  birthDate?: Moment;
  firstName: string;
  lastName: string;
  login?: string; // May be same as loginUsed if real login was used to log in
  loginAlias?: string; // May be same as loginUsed if alias was used to log in
  photo?: string; // = avatar url if defined. Keep in mind `avatar` property stores the Blob data of the image.
}

/**
 * Describes all data thet is tied to the logged user
 */
export interface AuthLoggedUserInfo extends AuthLoggedUserProfile {
  groups: string[];
  uniqueId?: string;
  children?: UserChildren;
  relatives?: UserPrivateData['parents'];
  classes?: string[];
  structures?: UserStructureWithClasses[];
}

export type DateTimeString = string;

/**
 * A generic token information
 */
export interface AuthToken {
  value: string;
}

/**
 * A Bearer token used for authentication
 */
export interface AuthBearerToken extends AuthToken {
  type: 'Bearer';
  expiresAt: DateTimeString;
}

/**
 * A set of authentication tokens and scope information
 */
export interface AuthTokenSet {
  access: AuthBearerToken;
  refresh: AuthToken;
  scope: string[];
}

/**
 * Every info a saved account contains
 */
export interface AuthSavedAccount {
  platform: string;
  tokens: AuthTokenSet;
  user: AuthSavedAccountUserInfo;
}

export interface AuthLoggedAccountRights {
  apps: IEntcoreApp[];
  widgets: IEntcoreWidget[];
  authorizedActions: IAuthorizedAction[];
}

/**
 * Every info the logged account contains
 */
export interface AuthLoggedAccount {
  platform: Platform;
  tokens: AuthTokenSet;
  user: AuthLoggedUserInfo;
  rights: AuthLoggedAccountRights;
  type: SessionType;
  federated: boolean;
}

/**
 * All possible requirements after a user log in.
 * Formerly "partial session scenarios".
 */
export enum AuthRequirement {
  MUST_CHANGE_PASSWORD = 1,
  MUST_REVALIDATE_TERMS,
  MUST_VALIDATE_TERMS,
  MUST_VERIFY_MOBILE,
  MUST_VERIFY_EMAIL,
}

/**
 * Associates a saved account to each user id
 */
export type AuthSavedAccountMap = Record<string, AuthSavedAccount>;

export type AuthLoggedAccountMap = Record<string, AuthLoggedAccount>;

export type AuthMixedAccountMap = Record<string, AuthSavedAccount | AuthLoggedAccount>;

export interface IUser extends DisplayUserPublic {
  login: string;
  type: AccountTyoe;
}

export interface StructureNode {
  SIRET: string;
  UAI: string;
  academy: string;
  address: string;
  area: string;
  checksum: string;
  city: string;
  contract: string;
  created: string;
  distributions: any[];
  externalId: string;
  feederName: string;
  hasApp: boolean;
  id: string;
  joinKey: string[];
  levelsOfEducation: number[];
  manualName: boolean;
  ministry: string;
  modified: string;
  name: string;
  oldName: string;
  phone: string;
  source: string;
  type: string;
  zipCode: string;
}

export interface UserStructureWithClasses extends StructureNode {
  classes: string[];
}

/**
 * Describes all editable profile values as text-only, without verifications.
 */
export interface ILoggedUserProfile extends DisplayUserPublic, AuthUserContactDetails {
  birthDate?: Moment;
  firstName: string;
  lastName: string;
  homePhone?: string; // It's not in LoggedUserContactDetails because there is no logic associed with it unlike mobile.
  loginAlias?: string;
}

/**
 * Describes the user that is logged in currently (private info)
 */
export interface ILoggedUser extends IUser, ILoggedUserProfile {
  groups: string[];
  uniqueId?: string;
  children?: UserChildren;
  classes?: string[];
  relatives?: UserPrivateData['parents'];
  structures?: UserStructureWithClasses[];
}

export interface UserChild {
  classesNames: string[];
  displayName: string;
  externalId?: string;
  lastName: string;
  firstName: string;
  id: string;
}

/** user children, grouped by structure */
export type UserChildren = {
  structureName: string;
  children: UserChild[];
}[];

/** user children, not regrouped by structure */
export type UserChildrenFlattened = (UserChild & {
  structureName: string;
})[];

export enum SessionType {
  PERMANENT,
  TEMPORARY,
}

/**
 * Current session information including authentification, rights & user info.
 */
export interface ISession {
  platform: Platform;
  oauth2: OAuth2RessourceOwnerPasswordClient;
  apps: IEntcoreApp[];
  widgets: IEntcoreWidget[];
  authorizedActions: IAuthorizedAction[];
  user: AuthLoggedUserInfo;
  type: SessionType; // Is Session remembering set on ?
  federated: boolean;
}

/** Error codes as an enum, values can be string that backend returns */
export enum RuntimeAuthErrorCode {
  ACTIVATION_ERROR = 'activation_error',
  EMAILVALIDATIONINFOS_FAIL = 'emailvalidationinfos_fail',
  FIREBASE_ERROR = 'firebase_error',
  LOAD_I18N_ERROR = 'loadi18nerror',
  MOBILEVALIDATIONINFOS_FAIL = 'mobilevalidationinfos_fail',
  NETWORK_ERROR = 'network_error',
  NO_TOKEN = 'no_token',
  NOT_PREMIUM = 'not_premium',
  PLATFORM_NOT_EXISTS = 'platform_not_exists',
  PRE_DELETED = 'pre_deleted',
  RESTORE_FAIL = 'restore_fail',
  RUNTIME_ERROR = 'runtime_error',
  UNKNOWN_ERROR = 'unknown_error',
  USERINFO_FAIL = 'userinfo_fail',
  USERPUBLICINFO_FAIL = 'userpublicinfo_fail',
  USERREQUIREMENTS_FAIL = 'userrequirements_fail',
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

export function getAuthErrorCode(error: AuthErrorCode, platform: Platform) {
  return I18n.get('auth-error-' + error.replaceAll('_', ''), {
    version: DeviceInfo.getVersion(),
    errorcode: error,
    currentplatform: platform.url,
    defaultValue: I18n.get('auth-error-other', {
      version: DeviceInfo.getVersion(),
      errorcode: error,
      currentplatform: platform.url,
    }),
  });
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

export interface IAuthUsernameCredential {
  username: string;
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

/**
 * returns all the children in a single array.
 * @param children children as it exists in session
 * @returns children in a array, not regrouped by structure.
 */
export function getFlattenedChildren(children: ILoggedUser['children']): UserChildrenFlattened | undefined {
  if (!children) return children;
  const flattenedChildren: UserChildrenFlattened = [];
  for (const structure of children) {
    for (const child of structure.children) {
      flattenedChildren.push({ ...child, structureName: structure.structureName });
    }
  }
  return flattenedChildren;
}
