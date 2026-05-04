import React from 'react';

import { useSelector } from 'react-redux';

import { readShowAllApps } from '../storage';

import { addToCache } from '~/framework/components/picture/svg';
import { applyFilter } from '~/framework/modules/myapps/reducer/adapter';
import { selectAggregatedApps } from '~/framework/modules/myapps/reducer/selectors';
import { MyAppsFilter } from '~/framework/modules/myapps/types';

const precacheSvgIcons = (apps: Record<string, { icon?: string }>) => {
  for (const app of Object.values(apps)) {
    if (app.icon && !app.icon.includes('/') && !app.icon.includes('.')) {
      addToCache(app.icon);
    }
  }
};

export const useFilteredApps = (filter: MyAppsFilter) => {
  const aggregatedApps = useSelector(selectAggregatedApps);

  React.useEffect(() => {
    if (aggregatedApps) precacheSvgIcons(aggregatedApps);
  }, [aggregatedApps]);

  const showAllApps = readShowAllApps();

  return React.useMemo(() => {
    if (!aggregatedApps) return [];
    const filtered = applyFilter(aggregatedApps, filter) || [];
    if (showAllApps || filter.type === 'favorites') return filtered;
    if (filter.type === 'search') {
      return filtered.filter(app => app.isMobile || app.isFavorite);
    }
    return filtered.filter(app => app.isMobile);
  }, [aggregatedApps, filter, showAllApps]);
};
