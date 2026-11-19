import moment from 'moment';

import { Platform } from '~/framework/util/appConf';
import { FetchError, FetchErrorCode } from '~/framework/util/transport/error';
import {
  AccountType,
  AuthActiveAccount,
  AuthActiveAccountWithCredentials,
  AuthActiveAccountWithSaml,
  AuthActiveUserInfo,
  AuthActiveUserInfoRelative,
  AuthActiveUserInfoStudent,
  AuthSavedLoggedInAccount,
  InitialAuthenticationMethod,
  SessionPersistence,
  StructureNode,
  UserChild,
  UserChildren,
} from '~/modules/auth/model';

import { API } from './types';

export function formatSession(
  tokens: (AuthActiveAccount | AuthSavedLoggedInAccount)['tokens'],
  addTimestamp: number,
  logTimestamp: number,
  platform: Platform,
  loginUsed: string | undefined,
  userinfo: API.IUserInfoBackend,
  method?: InitialAuthenticationMethod,
  userPrivateData?: API.UserPrivateData,
  userPublicInfo?: API.UserPersonDataBackend,
  rememberMe?: boolean,
): AuthActiveAccount {
  if (
    !userinfo.apps ||
    !userinfo.widgets ||
    !userinfo.authorizedActions ||
    !userinfo.userId ||
    !userinfo.login ||
    !userinfo.type ||
    !userinfo.username ||
    !userinfo.groupsIds ||
    !userinfo.firstName ||
    !userinfo.lastName
  ) {
    throw new FetchError(FetchErrorCode.BAD_RESPONSE, 'Missing data in user info');
  }
  const user: Partial<AuthActiveUserInfo> = {
    avatar: userPublicInfo?.photo,
    birthDate: userinfo.birthDate ? moment(userinfo.birthDate) : undefined,
    classes: userinfo.classes,
    displayName: userinfo.username,
    email: userPrivateData?.email,
    firstName: userinfo.firstName,
    groups: userinfo.groupsIds,
    homePhone: userPrivateData?.homePhone,
    id: userinfo.userId,
    isAdml: userinfo.functions?.ADMIN_LOCAL ? true : false,
    lastName: userinfo.lastName,
    login: userinfo.login,
    loginUsed,
    mobile: userPrivateData?.mobile,
    structures: formatStructuresWithClasses(userPrivateData?.structureNodes, userPublicInfo?.schools),
    type: parseAccountType(userinfo.type) as any, // Fixme: auth model types are broken
    uniqueId: userinfo.uniqueId,
    // ... Add here every user-related (not account-related!) information that must be kept into the session. Keep it minimal.
  };
  // compute here detailed data about children (laborious)
  if (userPrivateData?.childrenStructure) {
    const children: {
      structureName: string;
      children: (Partial<UserChild> & Pick<UserChild, 'id'>)[];
    }[] = userPrivateData.childrenStructure;
    for (const structure of children) {
      if (!structure) continue;
      for (const child of structure.children) {
        const foundChild = userinfo.children?.[child.id];
        if (!foundChild) {
          throw new FetchError(FetchErrorCode.BAD_RESPONSE, 'Missing data in user children');
        }
        child.lastName = foundChild.lastName;
        child.firstName = foundChild.firstName;
      }
    }
    (user as AuthActiveUserInfoRelative).children = children as UserChildren;
  }
  if (userPrivateData?.parents) {
    (user as AuthActiveUserInfoStudent).relatives = userPrivateData.parents;
  }
  return {
    addTimestamp,
    logTimestamp,
    method,
    persist: rememberMe ? SessionPersistence.PERMANENT : SessionPersistence.TEMPORARY,
    platform,
    rights: {
      apps: userinfo.apps,
      authorizedActions: userinfo.authorizedActions,
      widgets: userinfo.widgets,
    },
    tokens,
    user: user as AuthActiveUserInfo,
  } as AuthActiveAccountWithCredentials | AuthActiveAccountWithSaml;
}

export function formatStructuresWithClasses(
  structureNodes?: StructureNode[],
  structuresWithClasses?: API.UserPersonDataStructureWithClasses[],
) {
  return structureNodes?.map(structure => ({
    ...structure,
    classes: structuresWithClasses?.find(sc => sc.id === structure.id)?.classes ?? [],
  }));
}

export function parseAccountType(type: API.AccountTypeBackend): AccountType {
  switch (type) {
    case API.AccountTypeBackend.Guest:
      return AccountType.Guest;
    case API.AccountTypeBackend.Personnel:
      return AccountType.Personnel;
    case API.AccountTypeBackend.Relative:
      return AccountType.Relative;
    case API.AccountTypeBackend.Student:
      return AccountType.Student;
    case API.AccountTypeBackend.Teacher:
      return AccountType.Teacher;
  }
}
