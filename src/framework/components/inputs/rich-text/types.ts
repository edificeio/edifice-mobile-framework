import { ReactNode } from 'react';

import { IWorkspaceUploadParams } from '~/framework/modules/workspace/service';

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
