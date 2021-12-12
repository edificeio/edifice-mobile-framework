import { listTimeline } from './list';
import { storeFilters } from './storedFilters';

import { Trackers } from '~/framework/util/tracker';

export const pickFilters = dispatch => selectedApps => {
  dispatch({
    selectedApps,
    type: 'PICK_FILTER_TIMELINE',
  });
};

export const setFilters = dispatch => (availableApps, legalapps) => {
  dispatch({
    availableApps,
    type: 'FILTER_TIMELINE',
  });

  storeFilters(availableApps);
  listTimeline(dispatch)(0, availableApps, legalapps);

  Trackers.trackEvent('Timeline', 'FILTER');
};
