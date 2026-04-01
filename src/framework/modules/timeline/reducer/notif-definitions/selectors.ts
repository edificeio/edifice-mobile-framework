import { IEntcoreNotificationType } from './notif-types';

import { IGlobalState } from '~/app/store';
import { getState } from '~/framework/modules/timeline/reducer';

export const registeredNotificationTypesData = (state: IGlobalState): IEntcoreNotificationType[] =>
  getState(state)?.notifDefinitions?.notifTypes?.data ?? [];
