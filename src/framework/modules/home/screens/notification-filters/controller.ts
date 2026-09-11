import * as React from 'react';

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

import { NotificationFilterItem, NotificationFiltersScreenProps } from './types';

const compareByLabel = (one: NotificationFilter, other: NotificationFilter) =>
  I18n.get(one.i18n).localeCompare(I18n.get(other.i18n), I18n.getLanguage());

const NOTIFICATION_FAMILY_FALLBACK: Record<string, { app?: string; color?: string; icon?: SvgIconName }> = {
  TIMELINE: { color: 'yellow', icon: 'report' },
  USERBOOK: { app: 'Directory' },
};

export function useNotificationFiltersController(navigation: NotificationFiltersScreenProps['navigation']) {
  const availableFilters = useSelector(state => moduleConfig.getState(state).notifDefinitions.notifFilters.data);
  const savedFilters = useSelector(state => moduleConfig.getState(state).notifSettings.notifFilterSettings.data);
  const appsByName = useSelector(selectAggregatedApps);
  const notifTypes = useSelector(registeredNotificationTypesData);

  const [selectedFilters, setSelectedFilters] = React.useState<typeof savedFilters>(savedFilters);

  const filterItems = React.useMemo<NotificationFilterItem[]>(() => {
    const appsByAlias = getAppLookupMap(appsByName);

    return [...availableFilters].sort(compareByLabel).map(filter => {
      const fallback = NOTIFICATION_FAMILY_FALLBACK[filter.type] ?? {};

      const typeWithApp = notifTypes.find(t => t.type === filter.type && t['app-name']);
      const appName = filter['app-name'] ?? typeWithApp?.['app-name'] ?? fallback.app;
      const app = appName ? (appsByName[appName] ?? appsByAlias.get(appName)) : undefined;

      return {
        checked: !!selectedFilters[filter.type],
        color: resolveAppColor(fallback.color ?? app?.color)?.toString(),
        filter,
        icon: fallback.icon ?? (app?.icon as SvgIconName | undefined),
      };
    });
  }, [appsByName, availableFilters, notifTypes, selectedFilters]);

  const selectedCount = React.useMemo(() => filterItems.filter(item => item.checked).length, [filterItems]);
  const areAllSelected = selectedCount === filterItems.length;
  const areNoneSelected = selectedCount === 0;
  const isPartiallyChecked = !areAllSelected && !areNoneSelected;

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
    areSomeSelected: isPartiallyChecked,
    canSave: hasUnsavedChanges && !areNoneSelected,
    filterItems,
    saveFilters,
    selectedCount,
    toggleAllFilters,
    toggleFilter,
  };
}
