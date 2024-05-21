import { ReactNode } from 'react';

import { AuthActiveAccount } from '~/framework/modules/auth/model';
import { IWorkspaceUploadParams } from '~/framework/modules/workspace/service';
import { LocalFile } from '~/framework/util/fileHandler';

export interface RichEditorFormProps {
  initialContentHtml: string;
  topForm: ReactNode;
  onChangeText: (html: string) => void;
  uploadParams: IWorkspaceUploadParams;
}

export interface RichEditorFormReduxProps {
  oneSessionId: AuthActiveAccount['tokens']['oneSessionId'];
}

export interface RichEditorFormAllProps extends RichEditorFormProps, RichEditorFormReduxProps {}

export enum UploadStatus {
  OK,
  KO,
  PENDING,
}

export interface UploadFile {
  localFile: LocalFile;
  status: UploadStatus;
  workspaceID?: string;
}
