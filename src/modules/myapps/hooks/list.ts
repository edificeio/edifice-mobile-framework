/**
 * The list of « Mes applis »: favorites and filters.
 */
import React from 'react';

import { useDispatch, useSelector } from 'react-redux';

import { useStorageBoolean } from '~/framework/util/storage/hooks';
import { saveFavorites, toggleFavorite } from '~/modules/myapps/actions';
import type { EntApp, MyAppsFilter } from '~/modules/myapps/model';
import { filterApps } from '~/modules/myapps/model/classification';
import { storage } from '~/modules/myapps/storage';
import { selectApps, selectPreferences } from '~/modules/myapps/store';

import { useAppModules } from './apps';
import type { MyAppsDispatch } from './types';

/** The favorites of the user, their status, and how to change them (each one throws if it can't be saved). */
export const useFavorites = () => {
  const { data, status } = useSelector(selectPreferences);
  const dispatch = useDispatch<MyAppsDispatch>();
  const favorites = React.useMemo(() => new Set(data.favorites), [data.favorites]);
  const toggle = React.useCallback((appName: string) => dispatch(toggleFavorite(appName)), [dispatch]);
  const save = React.useCallback((names: string[]) => dispatch(saveFavorites(names)), [dispatch]);
  return { favorites, save, status, toggle };
};

/**
 * The switch « show all the apps » (only the modules when off). `true` while nothing is stored, as it always was (see `storage.ts`).
 */
export const useShowAllApps = () => {
  const [value, setValue] = useStorageBoolean(storage, 'show-all-apps');
  return [value ?? true, setValue] as const;
};

/** The apps of a filter of the list, in the order to show them (see `filterApps`). */
export const useFilteredApps = (filter: MyAppsFilter): EntApp[] => {
  const { data: apps } = useSelector(selectApps);
  const { favorites } = useFavorites();
  const modules = useAppModules();
  const [showAllApps] = useShowAllApps();
  return React.useMemo(
    () => filterApps(apps, filter, { favorites, getModule: appName => modules.get(appName), showAllApps }),
    [apps, favorites, filter, modules, showAllApps],
  );
};
