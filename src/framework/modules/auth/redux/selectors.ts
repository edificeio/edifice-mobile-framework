import type { IGlobalState } from '~/app/store';
import { accountIsActive } from '~/framework/modules/auth/model';
import moduleConfig from '~/framework/modules/auth/module-config';
import type { IAuthState } from '~/framework/modules/auth/reducer';

export const authState = (s: IGlobalState) => s[moduleConfig.reducerName] as IAuthState;

export const session = (s: IGlobalState) => {
  const connectedId = authState(s).connected;
  const account = connectedId !== undefined ? authState(s).accounts[connectedId] : undefined;
  if (account && !accountIsActive(account)) {
    console.warn(`[Auth | session] Store corruption : account ${connectedId} is logged but does not have rights.`);
    return undefined;
  }
  return account;
};

export const oneSessionId = (s: IGlobalState) => {
  const connectedId = authState(s).connected;
  const account = connectedId !== undefined ? authState(s).accounts[connectedId] : undefined;
  if (account && !accountIsActive(account)) {
    console.warn(`[Auth | session] Store corruption : account ${connectedId} is logged but does not have rights.`);
    return undefined;
  }
  return account?.tokens.oneSessionId;
};
