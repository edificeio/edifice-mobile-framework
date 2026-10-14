import { tokenFetch } from '~/framework/util/transport';

import { AuthActiveAccount, AuthSavedLoggedInAccount } from '../model';
import {
  IEntcoreEmailValidationInfos,
  IEntcoreEmailValidationState,
  IEntcoreMobileValidationInfos,
  IEntcoreMobileValidationState,
} from './types';

export const mobileValidation = {
  getValidationState: async ({ tokens }: Pick<AuthActiveAccount | AuthSavedLoggedInAccount, 'tokens'>) =>
    tokenFetch.json<IEntcoreMobileValidationInfos>(tokens, '/directory/user/mobilestate'),
  requestCode: async ({ tokens }: Pick<AuthActiveAccount | AuthSavedLoggedInAccount, 'tokens'>, mobile: string) =>
    tokenFetch(tokens, '/directory/user/mobilestate', {
      body: JSON.stringify({ mobile }),
      method: 'PUT',
    }),
  validate: async ({ tokens }: Pick<AuthActiveAccount | AuthSavedLoggedInAccount, 'tokens'>, key: string) =>
    tokenFetch.json<IEntcoreMobileValidationState>(tokens, '/directory/user/mobilestate', {
      body: JSON.stringify({ key }),
      method: 'POST',
    }),
};

export const emailValidation = {
  getValidationState: async ({ tokens }: Pick<AuthActiveAccount | AuthSavedLoggedInAccount, 'tokens'>) =>
    tokenFetch.json<IEntcoreEmailValidationInfos>(tokens, '/directory/user/mailstate'),
  requestCode: async ({ tokens }: Pick<AuthActiveAccount | AuthSavedLoggedInAccount, 'tokens'>, email: string) =>
    tokenFetch(tokens, '/directory/user/mailstate', {
      body: JSON.stringify({ email }),
      method: 'PUT',
    }),
  validate: async ({ tokens }: Pick<AuthActiveAccount | AuthSavedLoggedInAccount, 'tokens'>, key: string) =>
    tokenFetch.json<IEntcoreEmailValidationState>(tokens, '/directory/user/mailstate', {
      body: JSON.stringify({ key }),
      method: 'POST',
    }),
};
