import * as React from 'react';

import type { NavigationProp, ParamListBase } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';

import { I18n } from '~/app/i18n';
import { useConfirmRemove } from '~/app/navigation/use-confirm-remove';
import { SvgIconName } from '~/framework/components/picture';
import { getAppLookupMap } from '~/framework/modules/myapps/hooks/lookup';
import { resolveAppColor, selectAggregatedApps } from '~/framework/modules/myapps/reducer';
import { setFiltersAction } from '~/framework/modules/timeline/actions/notif-settings';
import moduleConfig from '~/framework/modules/timeline/module-config';
import { NotificationFilter } from '~/framework/modules/timeline/reducer/notif-definitions/notif-filters';
import { registeredNotificationTypesData } from '~/framework/modules/timeline/reducer/notif-definitions/selectors';

import { NotificationFilterItem } from './types';

const compareByLabel = (one: NotificationFilter, other: NotificationFilter) =>
  I18n.get(one.i18n).localeCompare(I18n.get(other.i18n), I18n.getLanguage());

// Todo: include when refactoring myapps module for better app lookup and color resolution
const NOTIFICATION_FAMILY_OVERRIDE: Record<string, { app?: string; color?: string; icon?: SvgIconName }> = {
  TIMELINE: { color: 'yellow', icon: 'report' },
  USERBOOK: { app: 'Directory' },
};

export function useNotificationFiltersController(navigation: NavigationProp<ParamListBase>) {
  const availableFilters = useSelector(state => moduleConfig.getState(state).notifDefinitions.notifFilters.data);
  const savedFilters = useSelector(state => moduleConfig.getState(state).notifSettings.notifFilterSettings.data);
  const appsByName = useSelector(selectAggregatedApps);
  const notifTypes = useSelector(registeredNotificationTypesData);

  const [selectedFilters, setSelectedFilters] = React.useState<typeof savedFilters>(savedFilters);

  const filterItems = React.useMemo<NotificationFilterItem[]>(() => {
    const appsByAlias = getAppLookupMap(appsByName);

    return [...availableFilters].sort(compareByLabel).map(filter => {
      const override = NOTIFICATION_FAMILY_OVERRIDE[filter.type] ?? {};

      const typeWithApp = notifTypes.find(t => t.type === filter.type && t['app-name']);
      const appName = filter['app-name'] ?? typeWithApp?.['app-name'] ?? override.app;
      const app = appName ? (appsByName[appName] ?? appsByAlias.get(appName)) : undefined;

      return {
        color: resolveAppColor(override.color ?? app?.color)?.toString(),
        filter,
        icon: override.icon ?? (app?.icon as SvgIconName | undefined),
      };
    });
  }, [appsByName, availableFilters, notifTypes]);

  const selectedCount = React.useMemo(
    () => availableFilters.filter(({ type }) => selectedFilters[type]).length,
    [availableFilters, selectedFilters],
  );
  const areAllSelected = selectedCount === availableFilters.length;
  const areNoneSelected = selectedCount === 0;
  const isPartiallySelected = !areAllSelected && !areNoneSelected;

  const hasUnsavedChanges = React.useMemo(
    () => availableFilters.some(({ type }) => !!savedFilters[type] !== !!selectedFilters[type]),
    [availableFilters, savedFilters, selectedFilters],
  );

  const toggleAllFilters = React.useCallback(() => {
    const selected = !areAllSelected;
    setSelectedFilters(Object.fromEntries(availableFilters.map(({ type }) => [type, selected])));
  }, [areAllSelected, availableFilters]);

  const toggleFilter = React.useCallback((filter: NotificationFilter) => {
    setSelectedFilters(previous => ({ ...previous, [filter.type]: !previous[filter.type] }));
  }, []);

  const dispatch = useDispatch<ThunkDispatch<any, any, any>>();

  const saveFilters = React.useCallback(async () => {
    await dispatch(setFiltersAction(selectedFilters));
    navigation.goBack();
  }, [dispatch, navigation, selectedFilters]);

  useConfirmRemove(hasUnsavedChanges, {
    text: I18n.get('timeline-filters-leavealert-text'),
    title: I18n.get('timeline-filters-leavealert-title'),
  });

  return {
    areAllSelected,
    canSave: hasUnsavedChanges && !areNoneSelected,
    filterItems,
    isPartiallySelected,
    saveFilters,
    selectedCount,
    selectedFilters,
    toggleAllFilters,
    toggleFilter,
  };
}
