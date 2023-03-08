import AsyncStorage from '@react-native-async-storage/async-storage';

import { DEPRECATED_getCurrentPlatform } from '~/framework/util/_legacy_appConf';
import { uniqueId } from '~/infra/oauth';

import { Connection } from './Connection';

// DEPRECATED. Use fetchWithCache instead.

export const read = async (path: string, forceSync: boolean = true, platform: string = DEPRECATED_getCurrentPlatform()!.url) => {
  if (!DEPRECATED_getCurrentPlatform()) throw new Error('must specify a platform');
  if (!Connection.isOnline) {
    // tslint:disable-next-line:no-console
    console.debug("OLD DEPRECATED 'read' function: User offline, reading from cache");
  }
  const fromCache = await AsyncStorage.getItem(path);

  if (Connection.isOnline && !(!forceSync && fromCache)) {
    const response = await fetch(`${platform}${path}`, {
      headers: {
        'X-Device-Id': uniqueId(),
      },
    });
    const data = await response.json();
    await AsyncStorage.setItem(path, JSON.stringify(data));
    return data;
  }

  if (fromCache) {
    return JSON.parse(fromCache);
  }
  return [];
};
