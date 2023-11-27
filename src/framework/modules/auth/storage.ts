import { storage } from '~/framework/util/storage';
import moduleConfig from './module-config';

enum AuthStorageKeys {
  accountList = 'account-list',
  account = 'account',
  platform = 'platform',
}

interface AuthSavedAccountInfo {
  loginUsed: string;
  displayName: string;
  type: AccountType;
  avatar?: Blob;
}

interface AuthStorageData {
  accounts: {
    [userId: string]: {
      platform: string;
      tokens: AuthTokenSet;
      userinfo: AuthSavedAccountInfo;
    };
  };
}

export const authStorage = storage
  .create<AuthStorageData>()
  .withModule(moduleConfig)
  .setAppInit(function () {})
  .setSessionInit(function (session) {});

// export const aStorage = storage
//   .create<{ keyA1: boolean; keyA2: boolean; keyA3: number; keyA4: string; keyA5: { foo: 'bar' } }>()
//   .withPrefix('a')
//   .setAppInit(function () {
//     // console.debug('INIT', this.computeKey('keyA4'));
//   })
//   .setSessionInit(function (session) {
//     // console.debug('SESSION INIT', session.user.id);
//     this.set('keyA4', session.user.id);
//   });
// export const bStorage = storage.create<{ keyB: boolean; keyB2: number }>().withPrefix('b');
// export const cStorage = storage.compose<{ keyC: boolean }, typeof bStorage>(bStorage).withPrefix('c');

export type DateTimeString = string;

interface AuthToken {
  value: string;
}

interface AuthBearerToken extends AuthToken {
  type: 'Bearer';
  expiresAt: DateTimeString;
}

interface AuthTokenSet {
  access: AuthBearerToken;
  refresh: AuthToken;
  scope: string[];
}

enum AccountType {
  STUDENT = 'STUDENT',
  RELATIVE = 'RELATIVE',
  TEACHER = 'TEACHER',
  PERSONNEL = 'PERSONNEL',
  GUEST = 'GUEST',
}

export const getSavedAccounts = () => {
  // mock data
  // aStorage.set('keyA1', true);
  // aStorage.set('keyA3', 7);
  // aStorage.setJSON('keyA5', { foo: 'bar' });
  // cStorage.set('keyC', false);
  // bStorage.set('keyB', true);
  // bStorage.set('keyB2', 88);
  // bStorage.contains('keyB');
  // cStorage.contains('keyC');
  // mmkvStorageHelper.set('TEST', 555);
  // console.debug('keys', mmkvStorageHelper.getAllKeys());
  // console.debug(mmkvStorageHelper.getNumber('TEST'));
  // end mock
  // const accountIds = authStorage.getJSON(AuthStorageKeys.accountList) ?? [];
  // const ret = {} as AuthStorageData;
  // for (const id of accountIds) {
  //   ret[id] = getSavedAccount(id);
  // }
  // return ret;
};
