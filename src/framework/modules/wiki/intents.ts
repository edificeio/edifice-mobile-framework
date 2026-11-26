/**
 * What `wiki` opens when it is asked from elsewhere (`intents` of its config): its resources and its notifications.
 */
import { type ConfigForIntents, notificationIntent } from '~/app/module';
import { getAsResourceUriNotification } from '~/framework/util/notifications';

const WIKI_ID_REGEX = /\/wiki\/id\/([a-f0-9-]+)/i;
const PAGE_ID_REGEX = /\/page\/([a-f0-9-]+)/i;

export const intents: ConfigForIntents = {
  notification: [
    notificationIntent({
      callback: (notification, navigation) => {
        try {
          const wikiNotif = getAsResourceUriNotification(notification);
          if (!wikiNotif) return false;

          const wikiUri = wikiNotif?.resource.uri;
          const wikiId = wikiUri?.match(WIKI_ID_REGEX)?.[1];
          if (!wikiId) return false;
          navigation.navigate('wiki/summary', { resourceId: wikiId });
          return true;
        } catch {
          return false;
        }
      },
      eventType: ['SHARED', 'PAGE-DELETED'],
      type: 'WIKI',
    }),
    notificationIntent({
      callback: (notification, navigation) => {
        try {
          const wikiNotif = getAsResourceUriNotification(notification);
          if (!wikiNotif) return false;

          const wikiUri = wikiNotif?.resource.uri;
          const wikiId = wikiUri?.match(WIKI_ID_REGEX)?.[1];
          if (!wikiId) return false;

          const pageId = wikiUri?.match(PAGE_ID_REGEX)?.[1];
          if (!pageId) return false;

          navigation.navigate('wiki/reader', { pageId, resourceId: wikiId });
          return true;
        } catch {
          return false;
        }
      },
      eventType: ['PAGE-UPDATED', 'PAGE-CREATED', 'PAGE-VISIBLE'],
      type: 'WIKI',
    }),
  ],
  resource: [
    {
      callback: (resource, navigation) => {
        navigation.push('wiki/summary', { resourceId: resource.resourceId });
        return true;
      },
      resourceType: 'wiki',
    },
  ],
};
