import React from 'react';

import { useSelector } from 'react-redux';

import { applyFilter } from '~/framework/modules/myapps/reducer/adapter';
import { getAllappsShowedState, selectAggregatedApps } from '~/framework/modules/myapps/reducer/selectors';
import { MyAppsFilter } from '~/framework/modules/myapps/types';

export const useFilteredApps = (filter: MyAppsFilter) => {
  const aggregatedApps = useSelector(selectAggregatedApps);
  const showAllApps = useSelector(getAllappsShowedState);

  return React.useMemo(() => {
    if (!aggregatedApps) return [];
    const filtered = applyFilter(aggregatedApps, filter) || [];
    if (showAllApps || filter.type === 'favorites') return filtered;
    return filtered.filter(app => app.isMobile);
  }, [aggregatedApps, filter, showAllApps]);
};
