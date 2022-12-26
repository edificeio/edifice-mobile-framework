/**
 * Session getter
 * TEMPORARY MODULE : In waiting to a proper session management (auth module), this compatibility module exposes IUserSession getter from global redux state
 */
import { OAuth2RessourceOwnerPasswordClient } from '~/infra/oauth';
import { IUserAuthState } from '~/user/reducers/auth';
import { IUserInfoState } from '~/user/state/info';

import { DEPRECATED_getCurrentPlatform } from './_legacy_appConf';
import { Platform } from './appConf';
import { IEntcoreApp, IEntcoreWidget } from './moduleTool';

export enum UserType {
  Student = 'Student',
  Relative = 'Relative',
  Teacher = 'Teacher',
  Personnel = 'Personnel',
  Guest = 'Guest',
}
export interface IUserAuthorizedAction {
  name: string;
  displayName: string;
  type: 'SECURED_ACTION_WORKFLOW'; // ToDo add other types here
}
export interface IUserDefinition {
  login: string;
  id: string;
  displayName: string;
  firstName: string;
  lastName: string;
  photo: string;
  type: UserType;
  entcoreApps: IEntcoreApp[];
  entcoreWidgets: IEntcoreWidget[];
  authorizedActions: IUserAuthorizedAction[];
  groupsIds: string[];
}
export interface IUserSession {
  platform: Platform;
  oauth: OAuth2RessourceOwnerPasswordClient;
  user: IUserDefinition;
}
let sessionCache: IUserSession;
export const getUserSession = () => sessionCache;
export const computeUserSession = (authState?: IUserAuthState, infoState?: IUserInfoState) => {
  sessionCache = {
    platform: DEPRECATED_getCurrentPlatform()!,
    oauth: OAuth2RessourceOwnerPasswordClient.connection,
    user: {
      login: authState ? authState.login : sessionCache?.user?.login,
      id: infoState ? infoState.id : sessionCache?.user?.id,
      displayName: infoState ? infoState.displayName : sessionCache?.user?.displayName,
      type: infoState ? infoState.type : sessionCache?.user?.type,
      entcoreApps: authState ? authState.appsInfo : sessionCache?.user?.entcoreApps,
      entcoreWidgets: authState ? authState.widgets : sessionCache?.user?.entcoreWidgets,
      authorizedActions: infoState ? infoState.authorizedActions : sessionCache?.user?.authorizedActions,
      groupsIds: infoState ? infoState.groupsIds : sessionCache?.user?.groupsIds,
      firstName: infoState ? infoState.firstName : sessionCache?.user?.firstName,
      lastName: infoState ? infoState.lastName : sessionCache?.user?.lastName,
      photo: infoState ? infoState.photo : sessionCache?.user?.photo,
    },
  } as IUserSession;
};
