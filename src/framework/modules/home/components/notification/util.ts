import type { ITimelineNotification } from '~/framework/util/notifications';

import { USERBOOK_MOOD, USERBOOK_MOTTO } from './constants';

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** Author of a mood or a motto. No resource behind those two, only a profile to open. */
export const getUserbookAuthor = (notification: ITimelineNotification) =>
  notification.type === USERBOOK_MOOD || notification.type === USERBOOK_MOTTO ? notification.backupData?.sender : undefined;

/**
 * Cuts the message before the names the preview already shows.
 *
 * Apps end their message with them: "X a publié un billet <titre> dans le blog <nom>". Only what
 * comes first is kept. Removing the names one by one would leave "dans le blog ." hanging.
 */
export const cutMessageAtNames = (message: string, names: (string | undefined)[]) => {
  const positions = names
    .filter((name): name is string => !!name)
    .map(name => message.search(new RegExp(`<(a|strong|b)[^>]*>\\s*${escapeRegExp(name)}|${escapeRegExp(name)}`)))
    .filter(index => index > 0);

  if (!positions.length) return message;

  // What introduced the name is left over: a preposition, a space, a punctuation mark.
  return message
    .slice(0, Math.min(...positions))
    .replace(/(<[^>]*>|\s|[.,;:])+$/, '')
    .replace(/\s+\S{1,4}$/u, '');
};
