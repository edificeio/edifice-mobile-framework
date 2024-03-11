import { Storage } from '~/framework/util/storage';

import moduleConfig from './module-config';

// export const timelineStorage = new (class AuthStorage extends Storage<object> {})().withModule(moduleConfig);

export interface TimelineStorageData {
  foo: string;
}

export const storage = Storage.create<TimelineStorageData>().withModule(moduleConfig);
