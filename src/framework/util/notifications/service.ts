import { PermissionsAndroid, Platform } from 'react-native';

import { AuthorizationStatus, getMessaging, getToken, onTokenRefresh, requestPermission } from '@react-native-firebase/messaging';
import DeviceInfo from 'react-native-device-info';

import { AuthActiveAccount, AuthSavedLoggedInAccount } from '~/framework/modules/auth/model';
import { getSession } from '~/framework/modules/auth/redux/reducer';
import { Storage } from '~/framework/util/storage';
import { accountFetch } from '~/framework/util/transport';

import { AccountStorageHandler } from '../storage/account-storage-handler';

export interface FirebaseNotificationStorage {
  'last-known-firebase-token': string;
}

/**
 * Service for managing Firebase Cloud Messaging (FCM) tokens.
 * This service handles the registration and unregistration of FCM tokens for user accounts,
 * and ensures the app has the necessary permissions to receive notifications.
 * It is driven by the sessions (see `~/modules/notifications`): registered when a session starts, unregistered when it is released.
 */
class FirebaseCloudMessagingService {
  /** Unsubscribe function returned by the token refresh listener. */
  protected unsubscribeTokenRefresh?: () => void;

  /**
   * Build a storage slice for a specific account.
   *
   * @param account - An object containing the user information of the account.
   * @returns A storage slice for Firebase notifications with the appropriate prefix.
   */
  getStorageSliceForAccount(account: Pick<AuthSavedLoggedInAccount | AuthActiveAccount, 'user'>) {
    return Storage.device<FirebaseNotificationStorage>({ namespace: `${AccountStorageHandler.PREFIX_ACCOUNT}${account.user.id}` });
  }

  constructor() {
    // Listen for token change
    this.unsubscribeTokenRefresh = onTokenRefresh(getMessaging(), async newToken => {
      console.debug('[FirebaseMessagingService] Token refreshed', newToken);
      const session = getSession();
      if (session) {
        this.enablePushNotificationsForAccount(session);
      }
    });

    // console.debug('[FirebaseMessagingService] Service auto initialized ?', isAutoInitEnabled(getMessaging()));
  }

  /** Ensure that the app has the necessary permissions to receive notifications. Ask user for permission if needed. */
  public ensureNotificationPermissions = Platform.select({
    android: this.ensureNotificationPermissionsAndroid,
    default: async () => false,
    ios: this.ensureNotificationPermissionsIOS,
  });

  /** Ensure that the app has the necessary permissions to receive notifications on iOS. Ask user for permission if needed. */
  protected async ensureNotificationPermissionsIOS() {
    const authorizationStatus = await requestPermission(getMessaging());
    if (authorizationStatus !== AuthorizationStatus.AUTHORIZED) {
      // console.debug('[FirebaseMessagingService] ensureNotificationPermissionsIOS - Device permission to receive notifications is denied');
      return false;
    }
    return true;
  }

  /** Ensure that the app has the necessary permissions to receive notifications on Android. Ask user for permission if needed. */
  protected async ensureNotificationPermissionsAndroid() {
    const apiLevel = await DeviceInfo.getApiLevel();
    if (apiLevel < 33) {
      return true;
    } else {
      const result = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);
      if (result === PermissionsAndroid.RESULTS.GRANTED) {
        return true;
      }
      return false;
    }
  }

  /** Read current FCM token for given device or generate a new one from firebase sdk. */
  public async getFCMToken(checkPermissions = true) {
    try {
      if (checkPermissions && (await this.ensureNotificationPermissions()) === false) {
        return;
      }
      return getToken(getMessaging());
    } catch (e) {
      throw new global.Error('[FirebaseMessagingService] Error getting FCM token for this device', { cause: e });
    }
  }

  /**
   * Register FCM Token for provided account.
   * If token has changed for this account since last registration, the old one will be unregistered.
   */
  public async enablePushNotificationsForAccount(account: AuthSavedLoggedInAccount | AuthActiveAccount) {
    let token: string | undefined;
    try {
      const storageForAccount = this.getStorageSliceForAccount(account);
      token = await this.getFCMToken();
      if (!token) {
        console.error('[FirebaseMessagingService] putTokenForAccount - No token to put for -', account.user.displayName);
        return;
      }
      const lastKnownToken = storageForAccount.getString('last-known-firebase-token');
      if (lastKnownToken && lastKnownToken !== token) {
        // A failure here must not prevent the registration of the new token
        await this.disablePushNotificationsForAccount(account, lastKnownToken).catch(e =>
          console.error('[FirebaseMessagingService] putTokenForAccount - Unable to unregister the old token -', e),
        );
      }
      await accountFetch(account, `/timeline/pushNotif/fcmToken?fcmToken=${token}`, { method: 'PUT' });

      console.debug('[FirebaseMessagingService] putTokenForAccount - OK -', account.user.displayName, '-', token);
      storageForAccount.set('last-known-firebase-token', token);
    } catch (e) {
      // Not a blocking operation: the error is logged, and the registration is tried again at the next session
      console.error('[FirebaseMessagingService] putTokenForAccount - ERROR -', account.user.displayName, '-', token, '-', e);
    }
  }

  /**
   * Unregister the FCM Token that was registered for the account (or the given one). Does nothing when none was.
   * It throws when the platform could not be reached: the token stays known, and the next release of the account tries again.
   */
  public async disablePushNotificationsForAccount(account: AuthSavedLoggedInAccount | AuthActiveAccount, token?: string) {
    const storageForAccount = this.getStorageSliceForAccount(account);
    // What matters is the token that was registered for the account, not the current one of firebase, which may have changed since.
    token = token ?? storageForAccount.getString('last-known-firebase-token');
    if (!token) return;
    await accountFetch(account, `/timeline/pushNotif/fcmToken?fcmToken=${token}`, { method: 'DELETE' });
    console.debug('[FirebaseMessagingService] deleteTokenForAccount - OK -', account.user.displayName, '-', token);
    // The token given by `enablePushNotificationsForAccount` is an old one: the stored one is the new one, if any
    if (storageForAccount.getString('last-known-firebase-token') === token) storageForAccount.remove('last-known-firebase-token');
  }
}

export default new FirebaseCloudMessagingService();
