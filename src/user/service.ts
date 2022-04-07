import AsyncStorage from '@react-native-async-storage/async-storage';
import messaging from '@react-native-firebase/messaging';
import { Platform } from 'react-native';
import AppLink from 'react-native-app-link';
import DeviceInfo from 'react-native-device-info';

import { DEPRECATED_getCurrentPlatform } from '~/framework/util/_legacy_appConf';
import { Connection } from '~/infra/Connection';
import { fetchJSONWithCache, signedFetch } from '~/infra/fetchWithCache';

//https://stackoverflow.com/questions/6832596/how-to-compare-software-version-number-using-js-only-number
function _compareVersion(version1: string, version2: string) {
  if (version1 === version2) {
    return 0;
  }
  const a_components = version1.split('.');
  const b_components = version2.split('.');
  const len = Math.min(a_components.length, b_components.length);
  // loop while the components are equal
  for (let i = 0; i < len; i++) {
    // version1 bigger than version2
    if (parseInt(a_components[i]) > parseInt(b_components[i])) {
      return 1;
    }
    // version2 bigger than version1
    if (parseInt(a_components[i]) < parseInt(b_components[i])) {
      return -1;
    }
  }
  // If one's prefix the other, the longer one is greater.
  if (a_components.length > b_components.length) {
    return 1;
  }
  if (a_components.length < b_components.length) {
    return -1;
  }
  // Otherwise they are the same.
  return 0;
}
class UserService {
  static FCM_TOKEN_TODELETE_KEY = 'users.fcmtokens.todelete';
  lastRegisteredToken: string;
  pendingRegistration: 'initial' | 'delayed' | 'registered' = 'initial';
  constructor() {
    Connection.onEachNetworkBack(async () => {
      if (this.pendingRegistration == 'delayed') {
        await this.registerFCMToken();
      }
      this._cleanQueue();
    });
  }
  private async _cleanQueue() {
    const tokens = await this._getTokenToDeleteQueue();
    tokens.forEach(token => {
      this.unregisterFCMToken(token);
    });
  }
  private async _getTokenToDeleteQueue(): Promise<string[]> {
    try {
      const tokensCached = await AsyncStorage.getItem(UserService.FCM_TOKEN_TODELETE_KEY);
      const tokens: string[] = JSON.parse(tokensCached);
      if (tokens instanceof Array) {
        return tokens;
      } else {
        //console.debug("not an array?", tokens)
      }
    } catch (e) {
      // TODO: Manage error
    }
    return [];
  }
  private async _addTokenToDeleteQueue(token: string) {
    if (!token) {
      return;
    }
    //merge is not supported by all implementation
    const tokens = await this._getTokenToDeleteQueue();
    tokens.push(token);
    //keep uniq tokens
    const json = JSON.stringify(Array.from(new Set(tokens)));
    await AsyncStorage.setItem(UserService.FCM_TOKEN_TODELETE_KEY, json);
  }
  private async _removeTokenFromDeleteQueue(token: string) {
    if (!token) {
      return;
    }
    //merge is not supported by all implementation
    let tokens = await this._getTokenToDeleteQueue();
    tokens = tokens.filter(t => t != token);
    const json = JSON.stringify(tokens);
    await AsyncStorage.setItem(UserService.FCM_TOKEN_TODELETE_KEY, json);
  }
  async unregisterFCMToken(token: string | null = null) {
    try {
      if (!token) {
        token = await messaging().getToken();
      }
      const deleteTokenResponse = await signedFetch(
        `${DEPRECATED_getCurrentPlatform()!.url}/timeline/pushNotif/fcmToken?fcmToken=${token}`,
        { method: 'delete' },
      );
      this._removeTokenFromDeleteQueue(token);
    } catch (err) {
      //unregistering fcm token should not crash the login process
      if (Connection.isOnline) {
        //console.debug(err);
      } else {
        //when no connection => get it from property
        const tokenTOUnregister = token || this.lastRegisteredToken;
        this._addTokenToDeleteQueue(tokenTOUnregister);
      }
    }
  }
  async registerFCMToken(token: string | null = null) {
    try {
      this.pendingRegistration = 'initial';
      if (!token) {
        token = await messaging().getToken();
      }
      this.lastRegisteredToken = token;
      const putTokenResponse = await signedFetch(
        `${DEPRECATED_getCurrentPlatform()!.url}/timeline/pushNotif/fcmToken?fcmToken=${token}`,
        {
          method: 'put',
        },
      );
      this.pendingRegistration = 'registered';
      //try to unregister queue
      this._cleanQueue(); //clean queue on login
      //
    } catch (err) {
      //registering fcm token should not crash the login process
      if (Connection.isOnline) {
        //console.debug(err);
      } else {
        this.pendingRegistration = 'delayed';
      }
    }
  }

  async checkVersion(): Promise<{ canContinue: boolean; hasNewVersion: boolean; newVersion: string }> {
    try {
      if (!DEPRECATED_getCurrentPlatform()) throw new Error('must specify a platform');
      const url = `${DEPRECATED_getCurrentPlatform()!.url}/assets/mobileapp.json`;
      const res = await fetch(url);
      if (res.ok) {
        const json = await res.json();
        const version = DeviceInfo.getVersion();
        const bundleId = DeviceInfo.getBundleId();
        const info = json[bundleId];
        if (info) {
          const newVersion: string = info.version;
          const levelVersion = info.level;
          const hasNewVersion = _compareVersion(newVersion, version) > 0;
          const canContinue = hasNewVersion ? levelVersion != 'critical' : true;
          return { canContinue, hasNewVersion, newVersion };
        } else {
          //console.debug("[UserService] checkVersion: there isnt a new version for bundle ", bundleId, json.mobile)
        }
      } else {
        //console.debug("[UserService] checkVersion: there isnt a new version (not found) ", res.status, url, res)
      }
    } catch (e) {
      // TODO: Manage error
    }
    return { canContinue: true, hasNewVersion: false, newVersion: '' };
  }
  async redirectToTheStore() {
    const bundleId = DeviceInfo.getBundleId();
    const appName = DeviceInfo.getApplicationName();
    const appStoreLocale = 'fr';
    const playStoreId = bundleId;
    let appStoreId = null;
    if (Platform.OS == 'ios') {
      //get appstore id using itunes API
      const url = `http://itunes.apple.com/lookup?bundleId=${bundleId}`;
      const res = await fetch(url);
      if (res.ok) {
        const json = await res.json();
        appStoreId = json.resultCount > 0 ? json.results[0].trackId : null;
      } else {
        console.debug('[UserService] redirectToTheStore:could not found appstoreid for ', url);
      }
    }
    try {
      await AppLink.openInStore({ appName, appStoreId, appStoreLocale, playStoreId });
    } catch (e) {
      // TODO: Manage error
    }
  }
  async getUserChildren(userId: string) {
    try {
      const userChildren = await fetchJSONWithCache(`/directory/user/${userId}/children`);
      return userChildren;
    } catch (e) {
      console.warn('[UserService] getUserChildren: could not get children data', e);
    }
  }
}

export const userService = new UserService();
