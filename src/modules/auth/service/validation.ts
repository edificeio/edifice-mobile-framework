import { getModuleTransport } from '~/framework/util/transport';
import { AuthActiveAccount, AuthSavedLoggedInAccount } from '~/modules/auth/model';

import type { API } from './types';

// Typed with the scopes of the module (see `getModuleTransport`)
const { tokenFetch } = getModuleTransport('auth');

export const mobileValidation = {
  getValidationState: async ({ tokens }: Pick<AuthActiveAccount | AuthSavedLoggedInAccount, 'tokens'>) =>
    tokenFetch.json<API.MobileValidationInfosResponse>(tokens, '/directory/user/mobilestate'),
  requestCode: async ({ tokens }: Pick<AuthActiveAccount | AuthSavedLoggedInAccount, 'tokens'>, mobile: string) =>
    tokenFetch(tokens, '/directory/user/mobilestate', {
      body: JSON.stringify({ mobile }),
      method: 'PUT',
    }),
  validate: async ({ tokens }: Pick<AuthActiveAccount | AuthSavedLoggedInAccount, 'tokens'>, key: string) =>
    tokenFetch.json<API.MobileValidationStateResponse>(tokens, '/directory/user/mobilestate', {
      body: JSON.stringify({ key }),
      method: 'POST',
    }),
};

export const emailValidation = {
  getValidationState: async ({ tokens }: Pick<AuthActiveAccount | AuthSavedLoggedInAccount, 'tokens'>) =>
    tokenFetch.json<API.EmailValidationInfosResponse>(tokens, '/directory/user/mailstate'),
  requestCode: async ({ tokens }: Pick<AuthActiveAccount | AuthSavedLoggedInAccount, 'tokens'>, email: string) =>
    tokenFetch(tokens, '/directory/user/mailstate', {
      body: JSON.stringify({ email }),
      method: 'PUT',
    }),
  validate: async ({ tokens }: Pick<AuthActiveAccount | AuthSavedLoggedInAccount, 'tokens'>, key: string) =>
    tokenFetch.json<API.EmailValidationStateResponse>(tokens, '/directory/user/mailstate', {
      body: JSON.stringify({ key }),
      method: 'POST',
    }),
};

export const mfaValidation = {
  getValidationState: async ({ tokens }: Pick<AuthActiveAccount | AuthSavedLoggedInAccount, 'tokens'>) =>
    tokenFetch.json<API.MFAValidationInfosResponse>(tokens, '/auth/user/mfa/code'),
  validate: async ({ tokens }: Pick<AuthActiveAccount | AuthSavedLoggedInAccount, 'tokens'>, key: string) =>
    tokenFetch.json<API.MFAValidationStateResponse>(tokens, '/auth/user/mfa/code', {
      body: JSON.stringify({ key }),
      method: 'POST',
    }),
};
