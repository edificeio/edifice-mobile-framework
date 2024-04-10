import { ReactNode } from 'react';

import { IWorkspaceUploadParams } from '~/framework/modules/workspace/service';
import { LocalFile } from '~/framework/util/fileHandler';

export interface RichEditorFormProps {
  initialContentHtml: string;
  topForm: ReactNode;
  onChangeText: (html: string) => void;
  uploadParams: IWorkspaceUploadParams;
}

export enum UploadStatus {
  OK,
  KO,
  PENDING,
}

export interface UploadFile {
  localFile: LocalFile;
  status: UploadStatus;
}
