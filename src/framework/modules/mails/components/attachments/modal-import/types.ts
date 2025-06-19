import { ParamListBase, Route } from '@react-navigation/native';
import type { NativeStackNavigationOptions, NativeStackScreenProps } from '@react-navigation/native-stack';

import type { ImagePicked } from '~/framework/components/menus/actions';
import { IWorkspaceUploadParams } from '~/framework/modules/workspace/service';
import type { IModalsNavigationParams, ModalsRouteNames } from '~/framework/navigation/modals';
import { IPickOptions, LocalFile } from '~/framework/util/fileHandler';

export namespace AttachmentsImportScreenProps {
  export interface Public {}

  export interface NavParams {
    files: ImagePicked[];
    uploadParams: IWorkspaceUploadParams;
    redirectTo: Route<string, ParamListBase>;
    source: IPickOptions['source'];
    draftId: string;
  }

  export type Navigation = NativeStackScreenProps<IModalsNavigationParams, ModalsRouteNames.AttachmentsImport>;

  export type NavBarConfig = ({ navigation, route }: Navigation) => NativeStackNavigationOptions;

  export interface AllProps extends Public, Navigation {}
}

export enum UploadAttachmentStatus {
  IDLE,
  OK,
  KO,
  PENDING,
}

export interface UploadAttachment {
  localFile: LocalFile;
  status: UploadAttachmentStatus;
  id?: string;
  url?: string;
  error?: string;
}

export interface UploadedAttachment {
  filename: string;
  id: string;
  url: string;
}
