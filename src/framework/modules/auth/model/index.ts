import type { Moment } from 'moment';

import { Platform } from '~/framework/util/appConf';
import { IEntcoreApp, IEntcoreWidget } from '~/framework/util/moduleTool';

import type { IAuthorizedAction, UserPrivateData } from '../service';

/**
 * Every profile type for accounts. Each account is of one type only.
 * Parent teachers have two accounts, one for each type.
 */
export enum AccountType {
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
  displayName: string;
  id: string; // id is also used to get avatar
}

/**
 * Describes minimal info to display a user, but with account type hint
 */
export interface DisplayUserPublicWithType extends DisplayUserPublic {
  type: AccountType;
}

export const isUserWithType = (u: DisplayUserPublic): u is DisplayUserPublicWithType => !!(u as DisplayUserPublicWithType).type;

/**
 * Represent user information that a seved account contains
 */
export interface AuthSavedAccountUserInfo extends DisplayUserPublicWithType {
  loginUsed: string | undefined; // undefined if federation login
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
  login: string; // May be same as loginUsed if real login was used to log in
  loginAlias?: string; // May be same as loginUsed if alias was used to log in. May be undefined for federation / migrated accounts
  avatar?: string; // = avatar url if defined.
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

export interface AuthQueryParamToken extends AuthToken {
  type: 'QueryParam';
  expiresAt: DateTimeString;
}

/**
 * A set of authentication tokens and scope information
 */
export interface AuthTokenSet {
  access: AuthBearerToken;
  refresh: AuthToken;
  queryParam?: AuthQueryParamToken;
  scope: string[];
}

/**
 * Every info a saved account contains
 */
export interface AuthSavedAccount {
  platform: string;
  tokens?: AuthTokenSet;
  user: AuthSavedAccountUserInfo;
  addTimestamp: number;
}

export interface AuthSavedAccountWithTokens extends AuthSavedAccount {
  tokens: AuthTokenSet;
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
  addTimestamp: AuthSavedAccount['addTimestamp'];
}

export const accountIsLogged = (account: AuthLoggedAccount | AuthSavedAccount | undefined): account is AuthLoggedAccount => {
  // account that have rights object is currenty logged in.
  return account !== undefined && (account as AuthLoggedAccount).rights !== undefined;
};

export const accountIsLoggable = (
  account: AuthLoggedAccount | AuthSavedAccount | undefined,
): account is AuthSavedAccountWithTokens => {
  // account that have rights object is currenty logged in.
  return account !== undefined && (account as AuthSavedAccount).tokens !== undefined;
};

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
 * Cases that make the user be redirected to a page
 */
export enum AuthPendingRedirection {
  ACTIVATE = 'activate',
  RENEW_PASSWORD = 'renew_password',
}

export const ANONYMOUS_ACCOUNT_ID = 'migration';

/**
 * Associates a saved account to each user id
 */
export type AuthSavedAccountMap = Record<string, AuthSavedAccount>;

export type AuthLoggedAccountMap = Record<string, AuthLoggedAccount>;

export type AuthMixedAccountMap = Record<string, AuthSavedAccount | AuthSavedAccountWithTokens | AuthLoggedAccount>;

export interface IUser extends DisplayUserPublic {
  login: string;
  type: AccountType;
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
 * Describes all editable profile values.
 */
export interface ILoggedUserProfile extends DisplayUserPublic, AuthUserContactDetails {
  birthDate?: Moment;
  firstName: string;
  lastName: string;
  loginAlias?: string;
  avatar?: string;
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
  PERMANENT, // Session is to be saved to the storage
  TEMPORARY, // Session not saved, preventing auto-login
}

// export function getAuthErrorCode(error: InstanceType<typeof Error.LoginError>, platform: Platform) {
//   return I18n.get('auth-error-' + error.replaceAll('_', ''), {
//     version: DeviceInfo.getVersion(),
//     errorcode: error,
//     currentplatform: platform.url,
//     defaultValue: I18n.get('auth-error-other', {
//       version: DeviceInfo.getVersion(),
//       errorcode: error,
//       currentplatform: platform.url,
//     }),
//   });
// }

export interface PlatformAuthContext {
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
  const err: IActivationError = new global.Error('ACTIVATION: returned error') as any;
  err.name = 'EACTIVATION';
  err.type = type;
  err.error = error;
  err.description = description;
  return { ...err, ...additionalData } as IActivationError & T;
}

export interface AuthUsernameCredential {
  username: string;
}

export interface AuthCredentials extends AuthUsernameCredential {
  password: string;
}
export interface AuthSamlCredentials {
  saml: string;
}
export interface AuthCustomTokenCredentials {
  customToken: string;
}
export type AuthFederationCredentials = AuthSamlCredentials | AuthCustomTokenCredentials;
export type AuthAnyCredentials = AuthCredentials | AuthFederationCredentials;

export const credentialsAreLoginPassword = (credentials: AuthAnyCredentials): credentials is AuthCredentials =>
  (credentials as AuthCredentials).username !== undefined && (credentials as AuthCredentials).password !== undefined;
export const credentialsAreSaml = (credentials: AuthAnyCredentials): credentials is AuthSamlCredentials =>
  (credentials as AuthSamlCredentials).saml !== undefined;
export const credentialsAreCustomToken = (credentials: AuthAnyCredentials): credentials is AuthCustomTokenCredentials =>
  (credentials as AuthCustomTokenCredentials).customToken !== undefined;

export type ForgotMode = 'id' | 'password';

export interface IForgotPayload {
  login: string;
  firstName?: string;
  structureId?: string;
}

export interface IChangePasswordPayload {
  login: string;
  oldPassword?: string;
  newPassword: string;
  confirm: string;
  resetCode?: string;
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
  const err: IChangePasswordError = new global.Error('CHANGE PWD: returned error') as any;
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
/** Converts an actual logged account into a serialisable saved account information */

export const getSerializedLoggedOutAccountInfo = (account: AuthLoggedAccount) => {
  return {
    platform: account.platform.name,
    user: {
      displayName: account.user.displayName,
      id: account.user.id,
      loginUsed: account.user.loginUsed,
      type: account.user.type,
      avatar: account.user.avatar,
    },
    addTimestamp: account.addTimestamp,
  } as AuthSavedAccount;
}; /** Converts an actual logged account into a serialisable saved account information */

export const getSerializedLoggedInAccountInfo = (account: AuthLoggedAccount) => {
  return {
    ...getSerializedLoggedOutAccountInfo(account),
    tokens: account.tokens,
  } as AuthSavedAccount;
};

export const getOrderedAccounts = (accounts: AuthMixedAccountMap) =>
  Object.values(accounts).sort((a, b) => a.addTimestamp - b.addTimestamp);
