import { ParamListBase, Route } from '@react-navigation/native';
import type { NativeStackNavigationOptions, NativeStackScreenProps } from '@react-navigation/native-stack';

import { ModalPromiseNavigationParams } from '~/framework/components/modals/provider';
import type { MediaLibraryNavigationParams, mediaLibraryRouteNames } from '~/framework/modules/media/navigation';
import { LocalFile, SyncedFileWithId } from '~/framework/util/fileHandler';

export namespace ImportQueueScreenProps {
  export interface Public {}

  export interface NavParams extends ModalPromiseNavigationParams {
    redirectTo: Route<string, ParamListBase>;
  }

  export type Navigation = NativeStackScreenProps<MediaLibraryNavigationParams, (typeof mediaLibraryRouteNames)['import-queue']>;

  export type NavBarConfig = ({ navigation, route }: Navigation) => NativeStackNavigationOptions;

  export interface PromiseData {
    files: LocalFile[];
    uploadFn: (file: LocalFile) => Promise<SyncedFileWithId>;
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
