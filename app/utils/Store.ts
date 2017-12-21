import { AsyncStorage } from 'react-native'
import { AUTH_LOGIN_STORE } from '../constants/Auth'

export async function setLogin(value) {
  await AsyncStorage.setItem(AUTH_LOGIN_STORE, JSON.stringify(value))
}

export async function getLogin() {
  const authString = await AsyncStorage.getItem(AUTH_LOGIN_STORE)

  if (authString === null)
    return {
      username: '',
      password: '',
    }
  return JSON.parse(authString)
}

let seqNumber = 0;

/** calculate seq number ***/
export function getSeqNumber() : string {
  seqNumber++
  return seqNumber.toString();
}

