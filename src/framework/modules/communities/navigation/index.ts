import { ParamListBase } from '@react-navigation/native';

import moduleConfig from '~/framework/modules/communities/module-config';
import { CommunitiesDocumentsScreen } from '~/framework/modules/communities/screens/documents/types';
import type { CommunitiesHomeScreen } from '~/framework/modules/communities/screens/home';
import { CommunitiesListScreen } from '~/framework/modules/communities/screens/list';
import { CommunitiesMembersScreen } from '~/framework/modules/communities/screens/members';

export const communitiesRouteNames = {
  documents: `${moduleConfig.routeName}/documents` as 'documents',
  home: `${moduleConfig.routeName}/home` as 'home',
  list: `${moduleConfig.routeName}` as 'list',
  members: `${moduleConfig.routeName}/members` as 'members',
};
export interface CommunitiesNavigationParams extends ParamListBase {
  list: CommunitiesListScreen.NavParams;
  home: CommunitiesHomeScreen.NavParams;
  documents: CommunitiesDocumentsScreen.NavParams;
  members: CommunitiesMembersScreen.NavParams;
}
