import type { ITimelineNotification } from '~/framework/util/notifications';
import { isResourceUriNotification } from '~/framework/util/notifications';

import { USERBOOK_MOOD, USERBOOK_MOTTO } from './constants';

export const isUserbookNotification = (notification: ITimelineNotification) =>
  notification.type === USERBOOK_MOOD || notification.type === USERBOOK_MOTTO;

export const canOpenNotification = (notification: ITimelineNotification) =>
  isResourceUriNotification(notification) || isUserbookNotification(notification);

export const cutMessageBeforeResource = (message: string) => {
  const links = [...message.matchAll(/<a\b/gi)];
  if (links.length < 2) return message;

  // Tags left open, spaces and punctuation hang at the cut.
  return message.slice(0, links[1].index).replace(/(<[^>]*>|\s|[.,;:&nbsp;])+$/, '');
};
