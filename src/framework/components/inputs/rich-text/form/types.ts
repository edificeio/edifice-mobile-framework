import { ReactNode } from 'react';
import { ScrollViewProps, ViewStyle } from 'react-native';

import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { AuthActiveAccount } from '~/framework/modules/auth/model';
import { IWorkspaceUploadParams } from '~/framework/modules/workspace/service';
import { IModalsNavigationParams, ModalsRouteNames } from '~/framework/navigation/modals';
import { LocalFile } from '~/framework/util/fileHandler';

export interface RichEditorFormProps extends ScrollViewProps {
  initialContentHtml: string;
  topForm: ReactNode | ((onChange: () => void) => ReactNode);
  bottomForm?: ReactNode;
  onChangeText: (html: string) => void;
  uploadParams: IWorkspaceUploadParams;
  preventBackI18n?: { title: string; text: string };
  saving?: boolean;
  pageStyle?: ViewStyle;
  editorStyle?: ViewStyle;
  placeholder?: string;
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
