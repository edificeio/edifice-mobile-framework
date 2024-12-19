import { ReactNode } from 'react';

import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { AuthActiveAccount } from '~/framework/modules/auth/model';
import { IWorkspaceUploadParams } from '~/framework/modules/workspace/service';
import { IModalsNavigationParams, ModalsRouteNames } from '~/framework/navigation/modals';
import { LocalFile } from '~/framework/util/fileHandler';

export interface RichEditorFormProps {
  initialContentHtml: string;
  topForm: ReactNode | ((onChange: () => void) => ReactNode);
  onChangeText: (html: string) => void;
  uploadParams: IWorkspaceUploadParams;
  preventBackI18n?: { title: string; text: string };
  saving?: boolean;
}

export interface RichEditorFormReduxProps {
  oneSessionId: AuthActiveAccount['tokens']['oneSessionId'];
}

export interface RichEditorFormReduxNavParams {
  importResult: UploadedFile[];
}

export interface RichEditorFormAllProps
  extends RichEditorFormProps,
    RichEditorFormReduxProps,
    NativeStackScreenProps<IModalsNavigationParams, ModalsRouteNames.RichTextEditor> {}

export enum UploadStatus {
  IDLE,
  OK,
  KO,
  PENDING,
}

export interface UploadFile {
  localFile: LocalFile;
  status: UploadStatus;
  workspaceID?: string;
  error?: string;
}

export interface UploadedFile {
  status: UploadStatus;
  workspaceID?: string;
}
