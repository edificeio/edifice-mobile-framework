import * as React from 'react';

import { useDispatch, useSelector } from 'react-redux';

import { I18n } from '~/app/i18n';
import { modalScreenOptions } from '~/app/navigation/util';
import { AppDispatch } from '~/app/store';
import moduleConfig from '~/framework/modules/home/module-config';
import { registeredNotificationTypesData } from '~/framework/modules/home/reducer/notif-definitions/selectors';
import { buildFilterItems } from '~/framework/modules/home/screens/notification-filters/items';
import NotificationFiltersTemplate, {
  NotificationFilterSelection,
  saveFiltersAction,
} from '~/framework/modules/home/templates/notification-filters';
import { selectAggregatedApps } from '~/framework/modules/myapps/reducer';
import { setSentNotificationFiltersAction } from '~/framework/modules/user/actions';
import { userSelectors } from '~/framework/modules/user/reducer';
import { getSentNotificationFilters } from '~/framework/modules/user/storage';

import type { UserSentNotificationFiltersScreenPrivateProps } from './types';

const LABELS_I18N = {
  description: 'user-sentnotifications-filters-description',
  leaveAlertText: 'timeline-filters-leavealert-text',
  leaveAlertTitle: 'timeline-filters-leavealert-title',
  selectAll: 'timeline-filters-all',
  selectedCount: 'timeline-filters-selected',
};

export const computeNavBar = modalScreenOptions('fullScreenModal', () => ({
  headerRight: saveFiltersAction(true),
  title: I18n.get('timeline-filters-title'),
}));

export default function UserSentNotificationFiltersScreen({ navigation }: Readonly<UserSentNotificationFiltersScreenPrivateProps>) {
  const availableFilters = useSelector(state => moduleConfig.getState(state).notifDefinitions.notifFilters.data);
  const appsByName = useSelector(selectAggregatedApps);
  const notifTypes = useSelector(registeredNotificationTypesData);
  const sentNotificationFilters = useSelector(userSelectors.getSentNotificationFilters);
  const dispatch = useDispatch<AppDispatch>();

  const items = React.useMemo(
    () => buildFilterItems(availableFilters, appsByName, notifTypes),
    [appsByName, availableFilters, notifTypes],
  );

  const [saved, setSaved] = React.useState<NotificationFilterSelection | null>(null);

  const savedSelection = React.useMemo(
    () =>
      saved ??
      getSentNotificationFilters(
        items.map(({ id }) => id),
        sentNotificationFilters,
      ),
    [items, saved, sentNotificationFilters],
  );

  const saveFilters = React.useCallback(
    (selection: NotificationFilterSelection) => {
      dispatch(setSentNotificationFiltersAction(selection));
      setSaved(selection);
    },
    [dispatch],
  );

  // leaving once the template knows the selection is saved, otherwise it asks to confirm the leave.
  React.useEffect(() => {
    if (saved) navigation.goBack();
  }, [navigation, saved]);

  return (
    <NotificationFiltersTemplate
      items={items}
      labelsI18n={LABELS_I18N}
      navigation={navigation}
      onSave={saveFilters}
      savedSelection={savedSelection}
    />
  );
}
