import type { NativeStackNavigationOptions, NativeStackScreenProps } from '@react-navigation/native-stack';

import { MediaNavigationParams } from '../../navigation';

import { ModalPromiseNavigationParams } from '~/framework/navigation/promise/types';
import { LocalFile, SyncedFileWithId } from '~/framework/util/fileHandler';
import { IMedia } from '~/framework/util/media';

export namespace ImportQueueScreenProps {
  export interface Public {}

  export interface NavParams extends ModalPromiseNavigationParams {}

  export type Navigation = NativeStackScreenProps<MediaNavigationParams, 'import-queue'>;

  export type NavBarConfig = ({ navigation, route }: Navigation) => NativeStackNavigationOptions;

  export interface PromiseData {
    files: LocalFile[];
    uploadFn: (file: LocalFile) => Promise<SyncedFileWithId>;
    mediaType: IMedia['type'];
  }

  export interface AllProps extends Public, Navigation {}
}

export enum UploadStatus {
  IDLE,
  OK,
  KO,
  PENDING,
}

export interface UploadTaskToDo {
  status: UploadStatus.IDLE | UploadStatus.PENDING;
  file: LocalFile;
}

export interface UploadTaskDone {
  status: UploadStatus.OK;
  file: SyncedFileWithId;
}

export interface UploadTaskFailed {
  status: UploadStatus.KO;
  file: LocalFile;
  error?: string;
}

export type UploadTask = UploadTaskToDo | UploadTaskDone | UploadTaskFailed;
