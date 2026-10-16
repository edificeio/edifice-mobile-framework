/**
 * Push notifications (Firebase Cloud Messaging) of the accounts.
 * Registers/unregisters the device with the backend of the account. Crucial at login/logout/account switch.
 */

import firebaseService from '~/framework/util/notifications/service';
import type { AuthLoggedAccount } from '~/modules/auth/model';

export const notifications = {
  /** Stops pushing notifications of the account to this device. */
  disableForAccount: (account: AuthLoggedAccount) => firebaseService.disablePushNotificationsForAccount(account),
  /** Starts pushing notifications of the account to this device. Non blocking: failures are only logged. */
  enableForAccount: (account: AuthLoggedAccount) => firebaseService.enablePushNotificationsForAccount(account),
};
