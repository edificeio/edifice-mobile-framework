import * as React from 'react';

import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { MyAppsFilters } from '../components/my-apps-filters';
import { MyAppsList } from '../components/my-apps-list';

import { getStore } from '~/app/store';
import { PageView } from '~/framework/components/page';
import { IMyAppsNavigationParams, myAppsRouteNames } from '~/framework/modules/myAppMenu/navigation';
import { selectFilteredApps } from '~/framework/modules/myapps/reducer';
import { AppsInfoAggregated, MyAppsFilter } from '~/framework/modules/myapps/types';
import { NavigableModuleArray } from '~/framework/util/moduleTool';

export interface MyAppsHomeScreenProps extends NativeStackScreenProps<IMyAppsNavigationParams, typeof myAppsRouteNames.Home> {
  modules: NavigableModuleArray;
  secondaryModules: NavigableModuleArray;
  connectors: NavigableModuleArray;
}

const MyAppsHomeScreen = (_: MyAppsHomeScreenProps) => {
  const [apps, setApps] = React.useState<AppsInfoAggregated[]>([]);
  const filterInitialState: React.SetStateAction<MyAppsFilter> = { type: 'category', value: 'toutes' };
  const [filter, setFilter] = React.useState<MyAppsFilter>(filterInitialState);

  useFocusEffect(
    React.useCallback(() => {
      return () => {
        setFilter(filterInitialState);
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []),
  );

  React.useEffect(() => {
    const store = getStore();

    const updateApps = () => {
      const state = store.getState();
      const aggregatedApps = selectFilteredApps(state, filter);
      setApps(aggregatedApps);
    };

    updateApps();
    const unsubscribe = store.subscribe(updateApps);
    return unsubscribe;
  }, [filter]);

  const renderNewMyAppsGrid = () => {
    return (
      <MyAppsList
        apps={apps}
        onPressApp={app => {
          console.debug('PRESS-' + app.name);
          // props.navigation.navigate(app.address);
        }}
        onLongPressApp={app => console.debug('LONG PRESS-' + app.name)}
      />
    );
  };

  return (
    <PageView>
      <MyAppsFilters selectedFilter={filter} onFilterChange={setFilter} />
      {renderNewMyAppsGrid()}
    </PageView>
  );
};

export default MyAppsHomeScreen;
