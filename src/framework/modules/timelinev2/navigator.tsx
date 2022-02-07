import { NavigationScreenProp, NavigationState } from 'react-navigation';
import { createStackNavigator } from 'react-navigation-stack';

import { RouteMap } from '~/framework/util/moduleTool';
import { addViewTrackingToStackRoutes } from '~/framework/util/tracker/withViewTracking';

import TimelineScreen from './screens/TimelineScreen';
import WebViewScreen from './screens/TimelineWebViewScreen';
import FiltersScreen from './screens/TimelineFiltersScreen';
import { timelineSubModules } from './timelineModules';
import moduleConfig from './moduleConfig';

const namespaceTimelineSubModules = (rmap: RouteMap) =>
  Object.fromEntries(
    Object.entries(rmap).map(([k, v]) => [
      `${moduleConfig.routeName}/${k}`,
      v as {
        screen: React.ComponentClass<{ navigation: NavigationScreenProp<NavigationState> }, unknown>;
        doNotInjectViewTracking?: boolean;
      },
    ]),
  );

export default () => {
  console.log('[Timeline] subModules routes', namespaceTimelineSubModules(timelineSubModules.get()));
  return createStackNavigator(
    {
      ...addViewTrackingToStackRoutes({
        [`${moduleConfig.routeName}`]: {
          screen: TimelineScreen,
        },
        [`${moduleConfig.routeName}/goto`]: {
          screen: WebViewScreen,
        },
        [`${moduleConfig.routeName}/filters`]: {
          screen: FiltersScreen,
        },
      }),
      ...namespaceTimelineSubModules(timelineSubModules.get()),
    },
    {
      // Note: In Timeline module, there is NO native header. Only FakeHeaders allowed.
      headerMode: 'none',
    },
  );
};
