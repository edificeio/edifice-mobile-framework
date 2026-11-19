import type { Moment } from 'moment';
import { CountryCode } from 'react-native-phone-number-input';

import { Platform } from '~/framework/util/appConf';
import { IEntcoreApp, IEntcoreWidget } from '~/framework/util/moduleTool';

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
  External = 'External',
}

/**
 * Authentication method that was used to add this account
 */
export enum InitialAuthenticationMethod {
  LOGIN_PASSWORD,
  WAYF_SAML,
}

/**
 * If user asked to remember the session. (Temporary sessions are not used anymore.)
 */
export enum SessionPersistence {
  TEMPORARY, // Session not saved, preventing auto-login
  PERMANENT, // Session is to be saved to the storage
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

/**
 * Check if given display user is provided with type information.
 * @param u
 * @returns if user contains type information with type guards
 */
export const isDisplayUserWithType = (u: DisplayUserPublic | DisplayUserPublicWithType): u is DisplayUserPublicWithType =>
  (u as Partial<DisplayUserPublicWithType> & DisplayUserPublic).type !== undefined;

/**
 * Represent user information that a saved account contains
 */
interface AuthSavedUserInfoWithCredentials extends DisplayUserPublicWithType {
  loginUsed: string; // login that the user used to log in
}
/**
 * Represent user information that a saved account contains
 */
interface AuthSavedUserInfoWithSaml extends DisplayUserPublicWithType {
  // No additional information
}

interface AuthLoggedInAccountTokens {
  tokens: AuthTokenSet;
}

// Saved account that is Logged Out / Logged In

interface AuthSavedLoggedOutAccountCommon {
  platform: string; // name of the platform
  addTimestamp: number; // date of the account addition into the app to preserve display order.
}
interface AuthSavedLoggedInAccountCommon extends AuthSavedLoggedOutAccountCommon, AuthLoggedInAccountTokens {
  logTimestamp: number;
}

// Saved account that is Credentials / Saml

interface AuthSavedAccountWithCredentials {
  method?: InitialAuthenticationMethod.LOGIN_PASSWORD;
  user: AuthSavedUserInfoWithCredentials;
}

interface AuthSavedAccountWithFederation {
  method?: InitialAuthenticationMethod.WAYF_SAML;
  user: AuthSavedUserInfoWithSaml;
}

// Mixup between logged status and auth method

export interface AuthSavedLoggedOutAccountWithCredentials
  extends AuthSavedAccountWithCredentials, AuthSavedLoggedOutAccountCommon {}
export interface AuthSavedLoggedInAccountWithCredentials extends AuthSavedAccountWithCredentials, AuthSavedLoggedInAccountCommon {}

export interface AuthSavedLoggedOutAccountWithSaml extends AuthSavedAccountWithFederation, AuthSavedLoggedOutAccountCommon {}
export interface AuthSavedLoggedInAccountWithSaml extends AuthSavedAccountWithFederation, AuthSavedLoggedInAccountCommon {}

export type AuthSavedLoggedOutAccount = AuthSavedLoggedOutAccountWithCredentials | AuthSavedLoggedOutAccountWithSaml;
export type AuthSavedLoggedInAccount = AuthSavedLoggedInAccountWithCredentials | AuthSavedLoggedInAccountWithSaml;

export type AuthSavedAccount = AuthSavedLoggedOutAccount | AuthSavedLoggedInAccount;
/**
 * Any account that has tokens: the active one (connected) or a saved one.
 * ⚠️ Not the same meaning as the former `AuthLoggedAccount` (= active account only) of `~/framework/modules/auth/model`.
 */
export type AuthLoggedAccount = AuthActiveAccount | AuthSavedLoggedInAccount;

// Active Account

export interface UpdatableUserInfo {
  displayName: string;
  loginAlias?: string; // May be same as loginUsed if alias was used to log in.
  avatar?: string; // = avatar url if defined.
  birthDate?: Moment;
  email?: string;
  firstName: string;
  lastName: string;
  mobile?: string;
}

/**
 * Describes all visible values from active user profile.
 */
interface AuthActiveUserInfoCommon extends UpdatableUserInfo {
  id: string; // id is also used to get avatar
  classes?: string[];
  groups: string[];
  homePhone?: string;
  login: string; // May be same as loginUsed if real login was used to log in.
  structures?: UserStructureWithClasses[];
  uniqueId?: string;
  isAdml?: boolean;
}

export interface AuthActiveUserInfoStudent extends AuthActiveUserInfoCommon {
  type: AccountType.Student;
  relatives?: UserRelative[];
}
export interface AuthActiveUserInfoRelative extends AuthActiveUserInfoCommon {
  type: AccountType.Relative;
  children?: UserChildren;
}
export interface AuthActiveUserInfoTeacher extends AuthActiveUserInfoCommon {
  type: AccountType.Teacher;
}
export interface AuthActiveUserInfoPersonnel extends AuthActiveUserInfoCommon {
  type: AccountType.Personnel;
}
export interface AuthActiveUserInfoGuest extends AuthActiveUserInfoCommon {
  type: AccountType.Guest;
}

export type AuthActiveUserInfoForTypes =
  | AuthActiveUserInfoStudent
  | AuthActiveUserInfoRelative
  | AuthActiveUserInfoTeacher
  | AuthActiveUserInfoPersonnel
  | AuthActiveUserInfoGuest;

/**
 * Every info the logged account contains
 */
interface AuthActiveAccountCommon {
  platform: Platform;
  tokens: AuthTokenSet;
  rights: AuthActiveAccountRights;
  persist: SessionPersistence;
  addTimestamp: AuthSavedAccount['addTimestamp']; // date of the account addition into the app to preserve display order.
  logTimestamp: AuthSavedAccount['addTimestamp']; // date of the latest access to that account on this device.
  carbonioUserInfos?: AuthCarbonioUserInfos; // Carbonio (mails) account information, once fetched.
  requirement?: AuthRequirement; // Next action the user must perform before being able to use the app. Undefined if none.
}

interface AuthActiveUserInfoWithCredentialsSpecifics {
  loginUsed: string; // login that the user used to log in
}
interface AuthActiveUserInfoWithSamlSpecifics {
  // No additional information
}

export type AuthActiveUserInfo =
  | (AuthActiveUserInfoForTypes & AuthActiveUserInfoWithCredentialsSpecifics)
  | (AuthActiveUserInfoForTypes & AuthActiveUserInfoWithSamlSpecifics);

export interface AuthActiveAccountWithCredentials extends AuthActiveAccountCommon {
  method: InitialAuthenticationMethod.LOGIN_PASSWORD;
  user: AuthActiveUserInfoForTypes & AuthActiveUserInfoWithCredentialsSpecifics;
}
export interface AuthActiveAccountWithSaml extends AuthActiveAccountCommon {
  method: InitialAuthenticationMethod.WAYF_SAML;
  user: AuthActiveUserInfoForTypes & AuthActiveUserInfoWithSamlSpecifics;
}

export type AuthActiveAccount = AuthActiveAccountWithCredentials | AuthActiveAccountWithSaml;

/**
 * Account that is signed in, but cannot be used yet: the user must fulfill the requirement first (see `AuthRequirement`).
 * Its session has not started (see `flows/index.ts` for the lifecycle).
 */
export type AuthActiveAccountWithRequirement = AuthActiveAccount & { requirement: AuthRequirement };

/**
 * @deprecated use AuthActiveUserInfo;
 */
export type AuthLoggedUserInfo = AuthActiveUserInfoForTypes;

/**
 * Describes the contact information of a user
 */
export type AuthUserContactDetails = Pick<AuthActiveUserInfoForTypes, 'email' | 'mobile' | 'homePhone'>;

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
  oneSessionId?: AuthToken;
  carbonioToken?: string;
  scope: string[];
  origin: string;
}

/**
 * Carbonio user information, as returned by the mail backend
 */
export interface AuthCarbonioUserInfos {
  name?: string;
  [key: string]: unknown;
}

export interface AuthActiveAccountRights {
  apps: IEntcoreApp[];
  widgets: IEntcoreWidget[];
  authorizedActions: IAuthorizedAction[];
}

export const accountIsActive = (account: AuthActiveAccount | AuthSavedAccount | undefined): account is AuthActiveAccount => {
  // account that have rights object is currenty logged in & active.
  return account !== undefined && (account as Partial<AuthActiveAccount>).rights !== undefined;
};

export const accountIsLoggable = (
  account: AuthActiveAccount | AuthSavedAccount | undefined,
): account is AuthSavedLoggedInAccount => {
  // account that have rights object is currenty logged in.
  return account !== undefined && (account as Partial<AuthSavedLoggedInAccount>).tokens !== undefined;
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

/**
 * Associates a saved account to each user id
 */
export type AuthSavedAccountMap = Record<string, AuthSavedAccount>;

export type AuthLoggedAccountMap = Record<string, AuthLoggedAccount>;

export type AuthMixedAccountMap = Record<string, AuthSavedAccount | AuthLoggedAccount>;

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
 * @deprecated use AuthActiveAccount['user'] instead.
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
 * @deprecated use AuthActiveAccount['user'] instead.
 */
export interface ILoggedUser extends IUser, ILoggedUserProfile {
  groups: string[];
  uniqueId?: string;
  children?: UserChildren;
  classes?: string[];
  relatives?: UserRelative[];
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

export type ActivationMobileState = 'MOBILE_FORMAT_INVALID' | 'PRISTINE' | 'STALE';
export type ActivationEmailState = 'EMAIL_FORMAT_INVALID' | 'PRISTINE';

export interface PlatformAuthContext {
  cgu: boolean;
  passwordRegex: string;
  passwordRegexI18n?: { [lang: string]: string };
  passwordRegexI18nActivation?: { [lang: string]: string };
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
  mailState: ActivationEmailState;
  phone: string;
  acceptCGU: boolean;
  phoneCountry: CountryCode;
  phoneState: ActivationMobileState;
}

export interface IActivationError extends Error {
  name: 'EACTIVATION';
  type: string;
  error: string;
  description?: string;
}

export function createActivationError(type: string, error: string, description?: string, cause?: Error): IActivationError {
  const err: IActivationError = new global.Error('ACTIVATION: returned error', { cause }) as any;
  err.name = 'EACTIVATION';
  err.type = type;
  err.error = error;
  err.description = description;
  return err as IActivationError;
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

export type IChangePasswordFormData = {
  oldPassword: string;
  newPassword: string;
  confirm: string;
};

export type IChangePasswordPayload = {
  login: string;
  newPassword: string;
  confirm: string;
} & ({ oldPassword: string } | { resetCode: string });

export interface IChangePasswordError extends Error {
  name: 'ECHANGEPWD';
  type: string;
  error: string;
  description?: string;
}

export function createChangePasswordError(type: string, error: string, description?: string, cause?: Error): IChangePasswordError {
  const err: IChangePasswordError = new global.Error('CHANGE PWD: returned error', { cause }) as any;
  err.name = 'ECHANGEPWD';
  err.type = type;
  err.error = error;
  err.description = description;
  return err as IChangePasswordError;
}

/**
 * The password was changed, but signing in again with the new one failed (the cause is the sign-in error).
 * The change did succeed: the user must know it, and sign in with the new password.
 * Same shape as `IChangePasswordError` so a change password screen shows its `error` the same way.
 */
export interface IChangePasswordSignInError extends Omit<IChangePasswordError, 'name'> {
  name: 'ECHANGEPWD_SIGNIN';
}

export function createChangePasswordSignInError(error: string, cause: Error): IChangePasswordSignInError {
  const err = new global.Error('CHANGE PWD: password changed but sign in failed', { cause }) as any;
  err.name = 'ECHANGEPWD_SIGNIN';
  err.type = 'sign in';
  err.error = error;
  return err as IChangePasswordSignInError;
}

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
    addTimestamp: account.addTimestamp,
    method: account.method,
    platform: isSerializedLoggedInAccount(account) ? account.platform : account.platform.name,
    user: {
      displayName: account.user.displayName,
      id: account.user.id,
      ...(account.method === InitialAuthenticationMethod.LOGIN_PASSWORD ? { loginUsed: account.user.loginUsed } : undefined),
      avatar: (account.user as Partial<AuthActiveUserInfo>).avatar,
      type: account.user.type,
    },
  } as AuthSavedLoggedOutAccount;
};

/** Converts an actual logged account into a serialisable saved account information */
export const getSerializedLoggedInAccountInfo = (account: AuthLoggedAccount) => {
  return {
    ...getSerializedLoggedOutAccountInfo(account),
    tokens: account.tokens,
  } as AuthSavedAccount;
};

export const isSerializedLoggedInAccount = (
  account: AuthActiveAccount | AuthSavedLoggedInAccount,
): account is AuthSavedLoggedInAccount => typeof account.platform === 'string';

export const getOrderedAccounts = (accounts: AuthMixedAccountMap) =>
  Object.values(accounts).sort((a, b) => a.addTimestamp - b.addTimestamp);

export interface LegalUrls {
  cgu: string;
  personalDataProtection: string;
  cookies: string;
  userCharter: string;
}

// Formats shared with the API: the service gives them as the platform sends them (`API` of `service/types.ts` aliases them).

/** A relative of a student (`parents` of the private data of the user). */
export interface UserRelative {
  displayName: string;
  externalId?: string;
  id: string;
}

/** An action the user is allowed to do (`authorizedActions` of the user info). */
export interface IAuthorizedAction {
  name: string;
  displayName: string;
  type: 'SECURED_ACTION_WORKFLOW'; // ToDo add other types here
}

/** What the platform asks the user before the app can be used (see `AuthRequirement`). */
export interface IUserRequirements {
  forceChangePassword?: boolean;
  needRevalidateEmail?: boolean;
  needRevalidateTerms?: boolean;
  needRevalidateMobile?: boolean;
  needMfa?: boolean;
}

export interface IEntcoreMFAValidationInfos {
  state: IEntcoreMFAValidationState; // State of the current MFA code
  type: 'sms' | 'email'; // MFA validation type
  waitInSeconds: number; // Estimated number of seconds before code reaches cellphone or mailbox
}

export interface IEntcoreMFAValidationState {
  state: 'outdated' | 'pending' | 'valid'; // Validation state
  tries: number; // Number of remaining retries before code becomes outdated
  ttl: number; // Number of seconds remaining before expiration of the code
}

export interface IEntcoreMobileValidationInfos {
  displayName: string; // User display name
  firstName: string; // User first name
  lastName: string; // User last name
  mobile: string; // Current mobile of the user (possibly not verified)
  mobileState?: IEntcoreMobileValidationState | null; // State of the current mobile
  waitInSeconds: number; // Estimated number of seconds before code reaches cellphone
}

export interface IEntcoreMobileValidationState {
  pending?: string; // (optional) Current pending (or outdated) mobile being checked
  state: 'outdated' | 'pending' | 'valid'; // Validation state
  tries?: number; // (optional) Number of remaining retries before code becomes outdated
  ttl?: number; // (optional) Number of seconds remaining before expiration of the code
  valid: string; // (optional) Last known valid mobile (or empty string)
}

export interface IEntcoreEmailValidationInfos {
  displayName: string; // User display name
  email: string; // Current email address of the user (possibly not verified)
  emailState: IEntcoreEmailValidationState | null; // State of the current email address
  firstName: string; // User first name
  lastName: string; // User last name
  waitInSeconds: number; // Suggested time to wait for the validation email to be sent (platform configuration)
}

export interface IEntcoreEmailValidationState {
  pending?: string; // (optional) Current pending (or outdated) email address being checked
  state: 'unchecked' | 'outdated' | 'pending' | 'valid'; // Validation state
  tries?: number; // (optional) Remaining number of times a validation code can be typed in
  ttl?: number; // (optional) Seconds remaining for the user to type in the correct validation code
  valid: string; // Last known valid email address (or empty string)
}

/** Result of a « forgot id / password » request: the answer of the platform, and if it succeeded (`ok`). */
export interface ForgotResponse {
  ok: boolean;
  structures?: any[];
  error?: string;
}

/**
 * What a successful sign-in returns. The sign-in does not know if the account is added, replaced...:
 * it is up to the caller (see `flows/`) to decide what to do with it.
 */
export interface SignInResult {
  /** The account just signed in. If it has a `requirement`, the user can't use the app yet. */
  session: AuthActiveAccount;
  /** Platform auth context. Only fetched when the session has a requirement. */
  platformContext?: PlatformAuthContext;
  /** Platform legal urls. Only fetched when the session requirement needs them. */
  legalUrls?: LegalUrls;
}
