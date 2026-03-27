import React from 'react';

import { useSelector } from 'react-redux';

import { buildAppBadgesIndex, selectAggregatedApps } from '~/framework/modules/myapps/reducer';
import { registeredNotificationTypesData } from '~/framework/modules/timeline/reducer/notif-definitions/selectors';

export const useAppBadges = () => {
  const aggregatedApps = useSelector(selectAggregatedApps);
  const notifTypes = useSelector(registeredNotificationTypesData);

  return React.useMemo(() => {
    if (!aggregatedApps?.length || !notifTypes?.length) {
      return {};
    }

    return buildAppBadgesIndex(aggregatedApps, notifTypes);
  }, [aggregatedApps, notifTypes]);
};
