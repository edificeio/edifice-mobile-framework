import { ParamListBase } from '@react-navigation/native';

import moduleConfig from '~/framework/modules/newsv2/module-config';

// import type { Newsv2HomeScreenNavParams } from '~/framework/modules/module-name/screens/home';
// import type { Newsv2OtherScreenNavParams } from '~/framework/modules/module-name/screens/other';

export const newsv2RouteNames = {
  // home: `${moduleConfig.routeName}` as 'home', // keep 'Home' as Typescript type for the main screen
  // other: `${moduleConfig.routeName}/other` as 'other', // @scaffolder Typescript must have static types for code-completion. Use PascalCase for the type
};
export interface Newsv2NavigationParams extends ParamListBase {
  // home: Newsv2HomeScreenNavParams;
  // other: Newsv2OtherScreenNavParams;
}
