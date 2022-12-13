import { ParamListBase } from '@react-navigation/native';

import { IAbstractNotification } from '~/framework/util/notifications';

import moduleConfig from '../moduleConfig';

export const timelineRouteNames = {
  Home: `${moduleConfig.routeName}` as 'Home',
  Filters: `${moduleConfig.routeName}/filters` as 'Filters',
  Dummy: `${moduleConfig.routeName}/dummy` as 'Dummy',
};
export interface ITimelineNavigationParams extends ParamListBase {
  Home: { reloadWithNewSettings?: boolean; notification?: IAbstractNotification };
  Filters: undefined;
  Dummy: undefined;
}
