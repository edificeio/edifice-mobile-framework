import { ReactNode } from 'react';
import { ScrollViewProps, ViewStyle } from 'react-native';

import { NativeStackScreenProps } from '@react-navigation/native-stack';

import RichEditor from '~/framework/components/inputs/rich-text/editor/RichEditor';
import { AuthActiveAccount } from '~/framework/modules/auth/model';
import { IWorkspaceUploadParams } from '~/framework/modules/workspace/service/types';
import { IModalsNavigationParams, ModalsRouteNames } from '~/framework/navigation/modals';
import { LocalFile } from '~/framework/util/fileHandler/models';

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
  editorRef?: React.Ref<RichEditor>;
  /** When true (default), the toolbar shows the button to add photos. Set to false to disable. */
  allowMultimediaUpload?: boolean;
  /**
   * Optional override for inline image upload. When provided, files selected from the
   * photo picker are uploaded via this function instead of the default workspace service.
   * Must return the URL to embed in the <img> tag.
   */
  onInlineImageUpload?: (file: LocalFile) => Promise<string>;
}

export interface RichEditorFormReduxProps {
  oneSessionId: AuthActiveAccount['tokens']['oneSessionId'];
}

export interface RichEditorFormReduxNavParams {
  importResult: UploadedFile[];
}

export interface RichEditorFormAllProps
  extends
    RichEditorFormProps,
    RichEditorFormReduxProps,
    Partial<NativeStackScreenProps<IModalsNavigationParams, ModalsRouteNames.RichTextEditor>> {}

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
  /** Set when using a custom uploader (e.g. Carbonio) instead of workspace. */
  fileUrl?: string;
  error?: string;
}

export interface UploadedFile {
  status: UploadStatus;
  workspaceID?: string;
  /** Set when using a custom uploader (e.g. Carbonio) instead of workspace. */
  fileUrl?: string;
}
