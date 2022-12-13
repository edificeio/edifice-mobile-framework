import { ParamListBase } from '@react-navigation/native';

import moduleConfig from '../moduleConfig';

export const timelineRouteNames = {
  Home: `${moduleConfig.routeName}` as 'Home',
};
export interface ITimelineNavigationParams extends ParamListBase {
  Home: undefined;
}
