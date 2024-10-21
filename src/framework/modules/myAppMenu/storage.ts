import moduleConfig from './module-config';

import { Storage } from '~/framework/util/storage';

export interface MyAppsStorageData {
  'infobubble-ack': boolean;
}

const oldStorageKey = 'infoBubbleAck-myAppsScreen.redirect';

export const storage = Storage.create<MyAppsStorageData>(moduleConfig).setAppInit(function () {
  const oldValue = Storage.global.getString(oldStorageKey) as 'true' | 'false' | undefined;
  if (oldValue === 'true') {
    this.set('infobubble-ack', true);
  }
  Storage.global.delete(oldStorageKey);
});
