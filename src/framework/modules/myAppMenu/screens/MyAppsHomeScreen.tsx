import * as React from 'react';

import { useFocusEffect } from '@react-navigation/native';

import { MyAppsHomeScreenProps } from './types';
import { EMPTY_SCREEN_CONFIG, resolveEmptyScreenKey } from './utils';

import { getStore } from '~/app/store';
import { PageView } from '~/framework/components/page';
import { MyAppsFilters } from '~/framework/modules/myAppMenu/components/my-apps-filters';
import { MyAppsList } from '~/framework/modules/myAppMenu/components/my-apps-list';
import { selectFilteredApps } from '~/framework/modules/myapps/reducer';
import { AppsInfoAggregated, MyAppsFilter } from '~/framework/modules/myapps/types';

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

  /**
   * Navigation is passed by props:
   *  props.navigation.navigate(app.address);
   */
  const renderNewMyAppsGrid = () => {
    return (
      <MyAppsList
        apps={apps}
        emptyScreenConfig={EMPTY_SCREEN_CONFIG[resolveEmptyScreenKey(filter)]}
        isFavoritesFilter={filter.type === 'favorites'}
        onPressApp={app => {
          // _.navigation.navigate(app.moduleConfig?.routeName || app.address);
          console.debug('PRESS-' + app.name);
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
