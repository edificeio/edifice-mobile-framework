import { Storage } from '~/framework/util/storage';

import moduleConfig from './module-config';

export interface UserStorageData {}

export const storage = Storage.slice<UserStorageData>().withModule({ storage: { namespace: moduleConfig.storageName } });
