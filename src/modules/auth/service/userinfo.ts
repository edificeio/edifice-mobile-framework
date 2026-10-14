import { Error } from '~/framework/util/error';
import { tokenFetch } from '~/framework/util/transport';

import { AuthLoggedAccount, AuthRequirement } from '../model';
import { AccountTypeBackend, IUserInfoBackend, UserPersonDataBackend, UserPrivateData } from './types';
import { AccountError, AccountErrorCode } from '../model/error';

export async function fetchUserInfo({ tokens }: Pick<AuthLoggedAccount, 'tokens'>) {
  try {
    const userinfo = await tokenFetch.json<any>(tokens, '/auth/oauth2/userinfo', {
      headers: {
        Accept: 'application/json;version=2.0',
      },
    });

    // Legacy app names for eventual compatibility
    userinfo.appsNames = userinfo.apps.map((e: any) => e.name);
    if (userinfo.appsNames.includes('Cahier de texte')) userinfo.appsNames.push('Homeworks');
    if (userinfo.appsNames.includes('Espace documentaire')) userinfo.appsNames.push('Workspace');
    if (userinfo.appsNames.includes('Actualites')) userinfo.appsNames.push('News');
    return userinfo as IUserInfoBackend;
  } catch (e) {
    if (e instanceof Error.ErrorWithType) throw e;
    else throw new global.Error('Failed to fetch user info', { cause: e });
  }
}

/**
 * Ensures that the user has the right conditions to create a session. Fire an exception otherwise.
 * Note : in some cases (force change password, revalidate cgu, etc.), allows to create a session but not to use the app.
 *        These corner-cases are managed in dedicated functions.
 * @param userInfo get userInfo from `fetchUserInfo()`
 */
export function assertNotPredeleted(userinfo: IUserInfoBackend) {
  if (userinfo.deletePending) {
    throw new AccountError(AccountErrorCode.ACCOUNT_INELIGIBLE_PRE_DELETED, 'User is predeleted');
  }
}

export const getUserData = async (tokens: Pick<AuthLoggedAccount, 'tokens'>, requirement?: AuthRequirement) => {
  const infos = await fetchUserInfo(tokens);
  assertNotPredeleted(infos);
  // If we have requirements, we can't fetch public info, we mock it instead.
  const { userdata, userPublicInfo } = requirement
    ? { userdata: undefined, userPublicInfo: undefined }
    : await fetchUserPublicInfo(infos, tokens);

  return { privateInfos: infos, publicInfos: { userData: userdata, userPublicInfo } };
};

export async function fetchUserPublicInfo(userinfo: IUserInfoBackend, { tokens }: Pick<AuthLoggedAccount, 'tokens'>) {
  try {
    if (!userinfo.userId) {
      throw new global.Error('fetchUserPublicInfo : User id has not being returned by the server');
    }
    if (!userinfo.type) {
      throw new global.Error('fetchUserPublicInfo : User type has not being returned by the server');
    }

    await tokenFetch.json<any>(tokens, `/directory/user/${userinfo.userId}`);
    await tokenFetch.json<any>(tokens, `/userbook/api/person?id=${userinfo.userId}`);

    const [userdata, userPublicInfo] = await Promise.all([
      tokenFetch.json<any>(tokens, `/directory/user/${userinfo.userId}`),
      tokenFetch.json<any>(tokens, `/userbook/api/person?id=${userinfo.userId}`),
    ]);

    // We fetch children information only for relative users
    const childrenStructure: UserPrivateData['childrenStructure'] =
      userinfo.type === AccountTypeBackend.Relative
        ? await (tokenFetch.json<any>(tokens, `/directory/user/${userinfo.userId}/children`) as any)
        : undefined;
    if (childrenStructure) {
      userdata.childrenStructure = childrenStructure;
    }

    // We enforce undefined parents for non-student users becase backend populates this with null data
    if (userinfo.type !== AccountTypeBackend.Student) {
      userdata.parents = undefined;
    }

    return { userdata, userPublicInfo: userPublicInfo.result?.[0] } as {
      userdata?: UserPrivateData;
      userPublicInfo?: UserPersonDataBackend;
    };
  } catch (e) {
    if (e instanceof Error.ErrorWithType) throw e;
    else throw new global.Error('Failed to fetch user public info', { cause: e });
  }
}
