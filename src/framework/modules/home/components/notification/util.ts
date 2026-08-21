import type { ITimelineNotification } from '~/framework/util/notifications';
import { isResourceUriNotification } from '~/framework/util/notifications';

import { USERBOOK_MOOD, USERBOOK_MOTTO } from './constants';

/** A mood or a motto. Those two are about their author, no resource stands behind them. */
export const isUserbookNotification = (notification: ITimelineNotification) =>
  notification.type === USERBOOK_MOOD || notification.type === USERBOOK_MOTTO;

/** Whether a tap leads somewhere: a resource for most, the profile of the author for the userbook. */
export const canOpenNotification = (notification: ITimelineNotification) =>
  isResourceUriNotification(notification) || isUserbookNotification(notification);

/**
 * Keeps what the message says before it names the resource, which the preview shows anyway.
 *
 * Every app writes the same shape: the author as a first link, then what they did, then the
 * resource as further links — "<a>X</a> a publié le billet <a>titre</a> dans le blog <a>nom</a>".
 * Cutting at the second link leaves "X a publié le billet", whatever the app and its wording.
 */
export const cutMessageBeforeResource = (message: string) => {
  const links = [...message.matchAll(/<a\b/gi)];
  if (links.length < 2) return message;

  // Tags left open, spaces and punctuation hang at the cut.
  return message.slice(0, links[1].index).replace(/(<[^>]*>|\s|[.,;:&nbsp;])+$/, '');
};
