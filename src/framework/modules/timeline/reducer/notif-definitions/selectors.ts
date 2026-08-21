import { IGlobalState } from '~/app/store';
import { getState } from '~/framework/modules/timeline/reducer';

import { IEntcoreNotificationType } from './notif-types';

const NO_NOTIFICATION_TYPE: IEntcoreNotificationType[] = [];

export const registeredNotificationTypesData = (state: IGlobalState): IEntcoreNotificationType[] =>
  getState(state)?.notifDefinitions?.notifTypes?.data ?? NO_NOTIFICATION_TYPE;
