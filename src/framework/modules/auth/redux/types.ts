import { AuthMixedAccountMap, AuthPendingRedirection, AuthRequirement, LegalUrls, PlatformAuthContext } from '../model';
import type { AuthStorageData } from '../storage';

export interface AuthState {
  accounts: AuthMixedAccountMap; // account list with populated info
  connected?: keyof AuthState['accounts']; // Currently logged user if so
  requirement?: AuthRequirement; // Requirement for the current account
  lastDeletedAccount?: keyof AuthState['accounts']; // Last account was deleted
  showOnboarding: AuthStorageData['show-onboarding'];
  platformContexts: Record<string, PlatformAuthContext | undefined>; // Platform contexts by pf name
  platformLegalUrls: Record<string, LegalUrls>; // Platform legal urls by pf name
  validReactionTypes: string[]; // Valid reaction types for audience

  pending?: AuthPendingRestore | AuthPendingActivation | AuthPendingPasswordRenew;
  pendingAddAccount?: AuthPendingRestore | AuthPendingActivation | AuthPendingPasswordRenew;

  error?: {
    // No need to affiliate the error to a platform since the `key` contains the render ID on the screen
    key?: number;
    info: Error;
  };

  deviceInfo: {
    uniqueId?: string;
  };

  lastAddAccount: number;
}

export interface AuthPendingActivation {
  redirect: AuthPendingRedirection.ACTIVATE;
  platform: string;
  loginUsed: string;
  code: string;
}

export interface AuthPendingRestore {
  redirect: undefined;
  account?: keyof AuthState['accounts']; // If it concerns a saved account, which one
  platform: string; // Platform id of the login task (duplicated the value in `account` if present)
  loginUsed?: string; // Login to display if account is not defined
}

export interface AuthPendingPasswordRenew {
  redirect: AuthPendingRedirection.RENEW_PASSWORD;
  platform: string;
  loginUsed: string;
  code: string;
  accountId?: keyof AuthState['accounts']; // If it concerns a saved account, which one
  accountTimestamp?: number;
}
