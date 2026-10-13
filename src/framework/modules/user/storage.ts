import { Storage } from '~/framework/util/storage';

export interface UserStorageData {}

export const storage = Storage.device<UserStorageData>({ namespace: 'user' });
