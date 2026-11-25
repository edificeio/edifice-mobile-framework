import * as React from 'react';

import { useSelector } from 'react-redux';

import { I18n } from '~/app/i18n';
import { modalScreenOptions } from '~/app/navigation/util';
import moduleConfig from '~/framework/modules/home/module-config';
import { registeredNotificationTypesData } from '~/framework/modules/home/reducer/notif-definitions/selectors';
import { buildFilterItems } from '~/framework/modules/home/screens/notification-filters/items';
import { getSentNotificationsFilters } from '~/framework/modules/home/storage';
import NotificationFiltersTemplate, {
  NotificationFilterSelection,
  saveFiltersAction,
} from '~/framework/modules/home/templates/notification-filters';
import { selectAggregatedApps } from '~/framework/modules/myapps/reducer';
import { userRouteNames } from '~/framework/modules/user/navigation';

import type { HomeSentNotificationFiltersScreen } from './types';

const LABELS_I18N = {
  description: 'user-sentnotifications-filters-description',
  leaveAlertText: 'timeline-filters-leavealert-text',
  leaveAlertTitle: 'timeline-filters-leavealert-title',
  selectAll: 'timeline-filters-all',
  selectedCount: 'timeline-filters-selected',
};

export const HomeSentNotificationFiltersScreenOptions = modalScreenOptions('fullScreenModal', () => ({
  headerRight: saveFiltersAction(true),
  title: I18n.get('timeline-filters-title'),
}));

export default function HomeSentNotificationFiltersScreen({
  navigation,
  route: {
    params: { selection },
  },
}: Readonly<HomeSentNotificationFiltersScreen.AllProps>) {
  const availableFilters = useSelector(state => moduleConfig.getState(state).notifDefinitions.notifFilters.data);
  const appsByName = useSelector(selectAggregatedApps);
  const notifTypes = useSelector(registeredNotificationTypesData);

  const items = React.useMemo(
    () => buildFilterItems(availableFilters, appsByName, notifTypes),
    [appsByName, availableFilters, notifTypes],
  );

  const [saved, setSaved] = React.useState<NotificationFilterSelection | null>(null);

  const savedSelection = React.useMemo(
    () => saved ?? selection ?? getSentNotificationsFilters(items.map(({ id }) => id)),
    [items, saved, selection],
  );

  // leaving once the template knows the selection is saved, otherwise it asks to confirm the leave.
  React.useEffect(() => {
    if (saved) navigation.popTo(userRouteNames.sentNotifications, { selection: saved });
  }, [navigation, saved]);

  return (
    <NotificationFiltersTemplate
      items={items}
      labelsI18n={LABELS_I18N}
      navigation={navigation}
      onSave={setSaved}
      savedSelection={savedSelection}
    />
  );
}
