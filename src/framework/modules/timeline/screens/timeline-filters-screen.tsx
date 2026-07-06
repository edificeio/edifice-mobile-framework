import * as React from 'react';

import { FlashList } from '@shopify/flash-list';
import { useDispatch, useSelector } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';

import { I18n } from '~/app/i18n';
import { ModuleScreenProps } from '~/app/navigation/types';
import { useConfirmRemove } from '~/app/navigation/use-confirm-remove';
import { modalScreenOptions } from '~/app/navigation/util';
import CheckboxButton from '~/framework/components/buttons/checkbox';
import NavBarAction from '~/framework/components/navigation/navbar-action';
import { setFiltersAction } from '~/framework/modules/timeline/actions/notif-settings';
import moduleConfig from '~/framework/modules/timeline/module-config';
import { NotificationFilter } from '~/framework/modules/timeline/reducer/notif-definitions/notif-filters';
import { shallowEqual } from '~/framework/util/object';

export interface TimelineFiltersScreenProps extends ModuleScreenProps<'timeline/filters'> {}

export const TimelineFiltersScreenOptions = modalScreenOptions('fullScreenModal', () => ({
  headerRight: () => <NavBarAction icon="ui-check" disabled />,
  title: I18n.get('timeline-filters-title'),
}));

const sortFilters = (a: NotificationFilter, b: NotificationFilter) =>
  I18n.get(a.i18n).localeCompare(I18n.get(b.i18n), I18n.getLanguage());

export function TimelineFiltersScreen({ navigation }: TimelineFiltersScreenProps) {
  const _allFilters = useSelector(state => moduleConfig.getState(state).notifDefinitions.notifFilters);
  const allFilters = React.useMemo(() => [..._allFilters.data].sort(sortFilters), [_allFilters]);
  const savedFilters = useSelector(state => moduleConfig.getState(state).notifSettings.notifFilterSettings.data);

  const [selectedFilters, setSelectedFilters] = React.useState<typeof savedFilters>(savedFilters);

  const hasChanges = React.useMemo(() => !shallowEqual(savedFilters, selectedFilters), [savedFilters, selectedFilters]);
  const areAllChecked = React.useMemo(() => Object.values(selectedFilters).every(value => value), [selectedFilters]);
  const areAllUnchecked = React.useMemo(() => Object.values(selectedFilters).every(value => !value), [selectedFilters]);
  const hasOneChecked = React.useMemo(() => Object.values(selectedFilters).some(value => value), [selectedFilters]);
  const hasOneUnchecked = React.useMemo(() => Object.values(selectedFilters).some(value => !value), [selectedFilters]);

  const dispatch = useDispatch<ThunkDispatch<any, any, any>>();
  const saveFilters = React.useCallback(async () => {
    await dispatch(setFiltersAction(selectedFilters));
    requestAnimationFrame(() => navigation.popTo('timeline', { reloadWithNewSettings: true }));
  }, [dispatch, navigation, selectedFilters]);

  navigation.setOptions({
    headerRight: () => <NavBarAction icon="ui-check" disabled={!hasChanges || areAllUnchecked} onPress={saveFilters} />,
  });

  const toggleAll = React.useCallback(() => {
    const newValue = hasOneUnchecked;
    setSelectedFilters(Object.fromEntries(allFilters.map(({ type }) => [type, newValue])));
  }, [allFilters, hasOneUnchecked]);

  const toggleOne = React.useCallback((item: NotificationFilter) => {
    setSelectedFilters(previousSelectedFilters => ({
      ...previousSelectedFilters,
      [item.type]: !previousSelectedFilters[item.type],
    }));
  }, []);

  const ListHeaderComponent = React.useCallback(
    () =>
      allFilters.length < 2 ? null : (
        <CheckboxButton
          onPress={toggleAll}
          title="timeline-filters-all"
          checked={areAllChecked}
          partialyChecked={hasOneChecked && hasOneUnchecked}
        />
      ),
    [allFilters.length, areAllChecked, hasOneChecked, hasOneUnchecked, toggleAll],
  );

  const renderItem = React.useCallback(
    ({ item }) => <CheckboxButton onPress={() => toggleOne(item)} title={item.i18n} checked={selectedFilters[item.type]} />,
    [selectedFilters, toggleOne],
  );

  useConfirmRemove(hasChanges, {
    text: I18n.get('timeline-filters-leavealert-text'),
    title: I18n.get('timeline-filters-leavealert-title'),
  });

  return <FlashList data={allFilters} ListHeaderComponent={ListHeaderComponent} renderItem={renderItem} />;
}
