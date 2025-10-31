import moduleConfig from './module-config';

import { Storage } from '~/framework/util/storage';

export interface UserStorageData {}

export const storage = Storage.slice<UserStorageData>().withModule(moduleConfig);
