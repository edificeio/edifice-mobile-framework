import AsyncStorage from '@react-native-async-storage/async-storage';

import { DEPRECATED_getCurrentPlatform } from '~/framework/util/_legacy_appConf';

export async function setLogin(value) {
  if (!DEPRECATED_getCurrentPlatform()) throw new Error('must specify a platform');
  await AsyncStorage.setItem('STORE-LOGIN-' + DEPRECATED_getCurrentPlatform()!.name, JSON.stringify(value));
}

export async function getLogin() {
  if (!DEPRECATED_getCurrentPlatform()) throw new Error('must specify a platform');
  const authString = await AsyncStorage.getItem('STORE-LOGIN-' + DEPRECATED_getCurrentPlatform()!.name);

  if (authString === null) {
    return {
      login: '',
      password: '',
    };
  }
  return JSON.parse(authString);
}
