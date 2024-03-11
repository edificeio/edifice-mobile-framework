import { Storage } from '~/framework/util/storage';

import moduleConfig from './module-config';

// export const timelineStorage = new (class AuthStorage extends Storage<object> {})().withModule(moduleConfig);

export interface TimelineStorageData {
  foo: string;
  bar: { biz: boolean };
}

export const storage = Storage.create<TimelineStorageData>(moduleConfig).setAppInit(function () {
  console.debug('AAAAAA', this.computeKey('foo'));
});

export interface TimelinePreferencesData {
  glmusp: { dugy: boolean };
}

export const sessionStorage = Storage.preferences<TimelinePreferencesData>(moduleConfig, function (session) {
  console.debug('BBBBBB', this.computeKey('glmusp'));
});
