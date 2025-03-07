import type { ParamListBase } from '@react-navigation/native';

import moduleConfig from '~/framework/modules/wiki/module-config';
import type { WikiHomeScreen } from '~/framework/modules/wiki/screens/home';
import type { WikiReaderScreen } from '~/framework/modules/wiki/screens/reader';
import type { WikiSummaryScreen } from '~/framework/modules/wiki/screens/summary';

export const wikiRouteNames = {
  home: `${moduleConfig.routeName}` as 'home',
  reader: `${moduleConfig.routeName}/reader` as 'reader',
  summary: `${moduleConfig.routeName}/summary` as 'summary',
};
export interface WikiNavigationParams extends ParamListBase {
  home: WikiHomeScreen.NavParams;
  summary: WikiSummaryScreen.NavParams;
  reader: WikiReaderScreen.NavParams;
}
