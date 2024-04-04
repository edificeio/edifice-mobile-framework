import type { IGlobalState } from '~/app/store';

import { accountIsLogged } from '../model';
import moduleConfig from '../module-config';
import type { IAuthState } from '../reducer';

export const authState = (s: IGlobalState) => s[moduleConfig.reducerName] as IAuthState;

export const session = (s: IGlobalState) => {
  const connectedId = authState(s).connected;
  const account = connectedId !== undefined ? authState(s).accounts[connectedId] : undefined;
  if (account && !accountIsLogged(account)) {
    console.warn(`[Auth | session] Store corruption : account ${connectedId} is logged but does not have rights.`);
    return undefined;
  }
  return account;
};
