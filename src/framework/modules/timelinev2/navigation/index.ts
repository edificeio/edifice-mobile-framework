import { ParamListBase } from '@react-navigation/native';

import moduleConfig from '~/framework/modules/timelinev2/moduleConfig';
import { IAbstractNotification } from '~/framework/util/notifications';

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
