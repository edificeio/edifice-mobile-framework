/**
 * Intents of the modules (`intents` of their config): what they open when it is asked from elsewhere.
 */
import type { ResourceMedia } from '~/modules/media/types';

import type { ConfigForIntents, IntentNavigation, NotificationIntent } from './types';

/** What `runResourceIntents` reads of a module. */
type ModuleWithIntents = { intents: ConfigForIntents };

/**
 * Opens a resource with the intents of the modules (`intents.resource`) whose `resourceType` is the one of the resource: they are
 * tried in the order of the modules, then of their lists, until one gives `true`.
 * @param modules the modules available for the user.
 * @returns whether an intent opened the resource (`false`: none is compatible, or none gave `true`).
 */
export const runResourceIntents = (
  modules: readonly ModuleWithIntents[],
  resource: ResourceMedia,
  navigation: IntentNavigation,
): boolean =>
  modules.some(module =>
    (module.intents.resource ?? []).some(
      intent => intent.resourceType === resource.resourceType && intent.callback(resource, navigation),
    ),
  );

/**
 * Declares an intent of notification (`intents.notification`) with the `type` and `event-type` of the notification given to its
 * callback: the ones it declares. Gives back the intent as is.
 */
export const notificationIntent = <const Type extends string, const EventType extends string>(
  intent: NotificationIntent<Type, EventType>,
): NotificationIntent<Type, EventType> => intent;
