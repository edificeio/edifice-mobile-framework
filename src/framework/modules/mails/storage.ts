import { MailsVisible } from './model';
import moduleConfig from './module-config';
import { mailsService } from './service';

import { Storage } from '~/framework/util/storage';

export interface MailsStorageData {
  visibles: MailsVisible[];
  lastcalltimestamp: number;
}

const enum MailsStorageKeys {
  VISIBLES = 'visibles',
  LAST_CALL_TIMESTAMP = 'lastcalltimestamp',
}

export const storage = Storage.slice<MailsStorageData>().withModule(moduleConfig);

export const readLastCallTimestamp = (): number => storage.getJSON(MailsStorageKeys.LAST_CALL_TIMESTAMP) ?? 0;

export const writeLastCallTimestamp = (timestamp: number) => {
  storage.setJSON(MailsStorageKeys.LAST_CALL_TIMESTAMP, timestamp);
};

export const readVisibles = (): MailsVisible[] => storage.getJSON(MailsStorageKeys.VISIBLES) ?? [];

export const writeVisibles = (visibles: MailsVisible[]) => {
  storage.setJSON(MailsStorageKeys.VISIBLES, visibles);
};

export const reloadVisibles = async () => {
  const now = Date.now();
  try {
    const visibles = await mailsService.visibles.get();
    writeVisibles(visibles);
    writeLastCallTimestamp(now);
  } catch (e) {
    console.error('[reloadVisibles] Failed to fetch visibles', e);
  }
};
