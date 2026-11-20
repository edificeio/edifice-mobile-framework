import React from 'react';

import { useSelector } from 'react-redux';

import { applyFilter, appShouldBeAtBottom, sortAppsByBookmarks } from '~/framework/modules/myapps/reducer/adapter';
import { selectAggregatedApps, selectAppBookmarks } from '~/framework/modules/myapps/reducer/selectors';
import { MyAppsFilter, MyAppsFilterCategories, MyAppsFilterTypes } from '~/framework/modules/myapps/types';

export const useFilteredApps = (filter: MyAppsFilter, showAllApps = false) => {
  const aggregatedApps = useSelector(selectAggregatedApps);
  const { bookmarks } = useSelector(selectAppBookmarks);

  return React.useMemo(() => {
    if (!aggregatedApps) return [];

    const allApps = Object.values(aggregatedApps).filter(app => app.display);
    const bottomApps = allApps.filter(appShouldBeAtBottom);

    const filtered = applyFilter(aggregatedApps, filter) ?? [];
    const filteredTopApps = filtered.filter(app => !appShouldBeAtBottom(app));

    const shouldShowBottomApps =
      filter.type === MyAppsFilterTypes.Search ||
      (filter.type === MyAppsFilterTypes.Category &&
        (filter.value === MyAppsFilterCategories.all || filter.value === MyAppsFilterCategories.otherServices));

    if (filter.type === MyAppsFilterTypes.Favorites) {
      return sortAppsByBookmarks(filtered, bookmarks ?? []);
    }

    let baseResult: typeof filteredTopApps;
    if (showAllApps) {
      baseResult = filteredTopApps;
    } else if (filter.type === MyAppsFilterTypes.Search) {
      baseResult = filteredTopApps.filter(app => app.isMobile || app.isFavorite);
    } else {
      baseResult = filteredTopApps.filter(app => app.isMobile);
    }

    const bottomAppsToShow = filter.type === MyAppsFilterTypes.Search ? filtered.filter(appShouldBeAtBottom) : bottomApps;
    return shouldShowBottomApps ? [...baseResult, ...bottomAppsToShow] : baseResult;
  }, [aggregatedApps, bookmarks, filter, showAllApps]);
};
