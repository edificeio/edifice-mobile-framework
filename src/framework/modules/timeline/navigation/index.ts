import { ParamListBase } from '@react-navigation/native';

import moduleConfig from '~/framework/modules/timeline/module-config';
import { TimelineSpaceScreenNavParams } from '~/framework/modules/timeline/screens/space';
import { IAbstractNotification } from '~/framework/util/notifications';

export const timelineRouteNames = {
  Filters: `${moduleConfig.routeName}/filters` as 'Filters',
  Home: `${moduleConfig.routeName}` as 'Home',
  space: `${moduleConfig.routeName}/space` as 'space',
};
export interface ITimelineNavigationParams extends ParamListBase {
  Home: { reloadWithNewSettings?: boolean; notification?: IAbstractNotification };
  Filters: undefined;
  space: TimelineSpaceScreenNavParams;
}
