import type { ParamListBase } from '@react-navigation/native';

import moduleConfig from '~/framework/modules/wiki/module-config';
import { WikiCreateScreen } from '~/framework/modules/wiki/screens/create';
import type { WikiHomeScreen } from '~/framework/modules/wiki/screens/home';
import type { WikiReaderScreen } from '~/framework/modules/wiki/screens/reader';
import type { WikiSummaryScreen } from '~/framework/modules/wiki/screens/summary';

export const wikiRouteNames = {
  create: `${moduleConfig.routeName}/create` as 'create',
  home: `${moduleConfig.routeName}` as 'home',
  reader: `${moduleConfig.routeName}/reader` as 'reader',
  summary: `${moduleConfig.routeName}/summary` as 'summary',
};
export interface WikiNavigationParams extends ParamListBase {
  create: WikiCreateScreen.NavParams;
  home: WikiHomeScreen.NavParams;
  summary: WikiSummaryScreen.NavParams;
  reader: WikiReaderScreen.NavParams;
}
