import * as React from 'react';

import { useDispatch, useSelector } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';

import { I18n } from '~/app/i18n';
import { modalScreenOptions } from '~/app/navigation/util';
import NotificationFiltersTemplate, {
  NotificationFilterSelection,
  saveFiltersAction,
} from '~/framework/modules/home/templates/notification-filters';
import { selectAggregatedApps } from '~/framework/modules/myapps/reducer';
import { setFiltersAction } from '~/framework/modules/timeline/actions/notif-settings';
import moduleConfig from '~/framework/modules/timeline/module-config';
import { registeredNotificationTypesData } from '~/framework/modules/timeline/reducer/notif-definitions/selectors';

import { buildFilterItems } from './items';
import { NotificationFiltersScreenProps } from './types';

const LABELS_I18N = {
  leaveAlertText: 'timeline-filters-leavealert-text',
  leaveAlertTitle: 'timeline-filters-leavealert-title',
  selectAll: 'timeline-filters-all',
  selectedCount: 'timeline-filters-selected',
};

export const NotificationFiltersScreenOptions = modalScreenOptions('fullScreenModal', () => ({
  headerRight: saveFiltersAction(true),
  title: I18n.get('timeline-filters-title'),
}));

export function NotificationFiltersScreen({ navigation }: Readonly<NotificationFiltersScreenProps>) {
  const availableFilters = useSelector(state => moduleConfig.getState(state).notifDefinitions.notifFilters.data);
  const savedFilters = useSelector(state => moduleConfig.getState(state).notifSettings.notifFilterSettings.data);
  const appsByName = useSelector(selectAggregatedApps);
  const notifTypes = useSelector(registeredNotificationTypesData);

  const items = React.useMemo(
    () => buildFilterItems(availableFilters, appsByName, notifTypes),
    [appsByName, availableFilters, notifTypes],
  );

  const dispatch = useDispatch<ThunkDispatch<any, any, any>>();

  const saveFilters = React.useCallback(
    async (selection: NotificationFilterSelection) => {
      await dispatch(setFiltersAction(selection));
      navigation.goBack();
    },
    [dispatch, navigation],
  );

  return (
    <NotificationFiltersTemplate
      items={items}
      labelsI18n={LABELS_I18N}
      navigation={navigation}
      onSave={saveFilters}
      savedSelection={savedFilters}
    />
  );
}
