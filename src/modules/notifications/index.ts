/**
 * Notifications module
 * Push notifications (Firebase Cloud Messaging): the device is registered with the platform of the account for the length of its
 * session, and unregistered when the session ends. Crucial at login/logout/account switch.
 */

import { CoreModule } from '~/app/module';
import firebaseService from '~/framework/util/notifications/service';

export default new CoreModule({
  name: 'notifications',

  // Failures are only logged: not being notified must not prevent the use of the app
  onSessionRelease: account => firebaseService.disablePushNotificationsForAccount(account),
  onSessionStart: session => firebaseService.enablePushNotificationsForAccount(session),

  scope: ['timeline'],
});
