import React from 'react';

import { useSelector } from 'react-redux';

import { applyFilter, appShouldBeAtBottom } from '~/framework/modules/myapps/reducer/adapter';
import { selectAggregatedApps } from '~/framework/modules/myapps/reducer/selectors';
import { MyAppsFilter, MyAppsFilterCategories, MyAppsFilterTypes } from '~/framework/modules/myapps/types';

export const useFilteredApps = (filter: MyAppsFilter, showAllApps = false) => {
  const aggregatedApps = useSelector(selectAggregatedApps);

  return React.useMemo(() => {
    if (!aggregatedApps) return [];

    const allApps = Object.values(aggregatedApps).filter(app => app.display);
    const bottomApps = allApps.filter(appShouldBeAtBottom);

    const filtered = applyFilter(aggregatedApps, filter) ?? [];
    const filteredTopApps = filtered.filter(app => !appShouldBeAtBottom(app));

    const shouldShowBottomApps =
      filter.type === MyAppsFilterTypes.Category &&
      (filter.value === MyAppsFilterCategories.all || filter.value === MyAppsFilterCategories.otherServices);

    if (filter.type === MyAppsFilterTypes.Favorites) {
      return filtered;
    }

    let baseResult: typeof filteredTopApps;
    if (showAllApps) {
      baseResult = filteredTopApps;
    } else if (filter.type === MyAppsFilterTypes.Search) {
      baseResult = filteredTopApps.filter(app => app.isMobile || app.isFavorite);
    } else {
      baseResult = filteredTopApps.filter(app => app.isMobile);
    }

    return shouldShowBottomApps ? [...baseResult, ...bottomApps] : baseResult;
  }, [aggregatedApps, filter, showAllApps]);
};
