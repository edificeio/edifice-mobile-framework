import { Storage } from '~/framework/util/storage';
import moduleConfig from './module-config';

export interface UserStorageData {
  xmasTheme: boolean;
  xmasMusic: boolean;
}

export const storage = Storage.slice<UserStorageData>().withModule(moduleConfig);

export const readXmasTheme = (): boolean => {
  return storage.getBoolean('xmasTheme') ?? true;
};

export const readXmasMusic = (): boolean => {
  return storage.getBoolean('xmasMusic') ?? false;
};

export const readAllXmasSettings = (): UserStorageData => {
  return {
    xmasTheme: readXmasTheme(),
    xmasMusic: readXmasMusic(),
  };
};

export const writeXmasTheme = (isActive: boolean) => {
  storage.set('xmasTheme', isActive);
};

export const writeXmasMusic = (isActive: boolean) => {
  storage.set('xmasMusic', isActive);
};
