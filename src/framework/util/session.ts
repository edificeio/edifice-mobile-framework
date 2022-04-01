/**
 * Session getter
 * TEMPORARY MODULE : In waiting to a proper session management (auth module), this compatibility module exposes IUserSession getter from global redux state
 */
import { OAuth2RessourceOwnerPasswordClient } from '~/infra/oauth';
import { IUserAuthState } from '~/user/reducers/auth';
import { IUserInfoState } from '~/user/state/info';



import { DEPRECATED_getCurrentPlatform } from './_legacy_appConf';
import { Platform } from './appConf';
import { IEntcoreApp } from './moduleTool';


export enum UserType {
  STUDENT,
  RELATIVE,
  TEACHER,
  PERSONNEL,
  GUEST,
}

export const getUserType = (type: string) => {
  switch (type) {
    case 'Student':
      return UserType.STUDENT;
    case 'Relative':
      return UserType.RELATIVE;
    case 'Teacher':
      return UserType.TEACHER;
    case 'Personnel':
      return UserType.PERSONNEL;
    case 'Guest':
      return UserType.GUEST;
  }
};

export interface IUserAuthorizedAction {
  name: string;
  displayName: string;
  type: 'SECURED_ACTION_WORKFLOW'; // ToDo add other types here
}

export interface IUserDefinition {
  login: string;
  id: string;
  displayName: string;
  type: UserType;
  entcoreApps: IEntcoreApp[];
  authorizedActions: IUserAuthorizedAction[];
  groupsIds: string[];
}

export interface IUserSession {
  platform: Platform;
  oauth: OAuth2RessourceOwnerPasswordClient;
  user: IUserDefinition;
}

export const getUserSession = (state: any) =>
  ({
    platform: DEPRECATED_getCurrentPlatform()!,
    oauth: OAuth2RessourceOwnerPasswordClient.connection,
    user: {
      login: (state.user.auth as IUserAuthState).login,
      id: (state.user.info as IUserInfoState).id,
      displayName: (state.user.info as IUserInfoState).displayName,
      type: getUserType(state.user.info.type),
      entcoreApps: (state.user.auth as IUserAuthState).appsInfo,
      authorizedActions: state.user.info.authorizedActions,
      groupsIds: state.user.info.groupsIds,
    },
  } as IUserSession);