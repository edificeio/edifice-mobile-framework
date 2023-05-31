import { NavigationScreenProp, NavigationState } from 'react-navigation';
import { createStackNavigator } from 'react-navigation-stack';

import { RouteMap } from '~/framework/util/moduleTool';
import { addViewTrackingToStackRoutes } from '~/framework/util/tracker/withViewTracking';

import moduleConfig from './moduleConfig';
import FiltersScreen from './screens/TimelineFiltersScreen';
import TimelineScreen from './screens/TimelineScreen';
import { timelineSubModules } from './timelineModules';

const namespaceTimelineSubModules = (rmap: RouteMap) => {
  const ret = {};
  for (const k in rmap) {
    ret[`${moduleConfig.routeName}/${k}`] = rmap[k] as {
      screen: React.ComponentClass<{ navigation: NavigationScreenProp<NavigationState> }, unknown>;
      doNotInjectViewTracking?: boolean;
    };
  }
  return ret;
};

export default () => {
  return createStackNavigator(
    {
      ...addViewTrackingToStackRoutes({
        [`${moduleConfig.routeName}`]: {
          screen: TimelineScreen,
        },
        [`${moduleConfig.routeName}/filters`]: {
          screen: FiltersScreen,
        },
      }),
      ...namespaceTimelineSubModules(timelineSubModules.get()),
    },
    {
      headerMode: 'none',
    },
  );
};
