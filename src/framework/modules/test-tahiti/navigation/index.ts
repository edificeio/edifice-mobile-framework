import { ParamListBase } from '@react-navigation/native';

import moduleConfig from '~/framework/modules/test-tahiti/module-config';
import type { TestTahitiHomeScreenNavParams } from '~/framework/modules/test-tahiti/screens/home';
import type { TestTahitiWebviewScreenNavParams } from '~/framework/modules/test-tahiti/screens/webview';

export const testTahitiRouteNames = {
  home: `${moduleConfig.routeName}` as 'home',
  webview: `${moduleConfig.routeName}/webview` as 'webview',
};
export interface TestTahitiNavigationParams extends ParamListBase {
  home: TestTahitiHomeScreenNavParams;
  webview: TestTahitiWebviewScreenNavParams;
}
