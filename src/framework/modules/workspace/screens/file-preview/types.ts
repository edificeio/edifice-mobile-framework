import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ThunkDispatch } from 'redux-thunk';

import { WorkspaceNavigationParams, workspaceRouteNames } from '~/framework/modules/workspace/navigation';
import { IFile } from '~/framework/modules/workspace/reducer';

export interface IWorkspaceFilePreviewScreenDataProps {
  file: IFile;
  title: string;
}

export interface IWorkspaceFilePreviewScreenEventProps {
  downloadFile: (file: IFile[]) => void;
  previewFile: (file: IFile, navigation: NavigationInjectedProps['navigation']) => void;
  shareFile: (file: IFile) => void;
  dispatch: ThunkDispatch<any, any, any>;
}

export interface IWorkspaceFilePreviewScreenNavigationParams {
  file: IFile;
  title: string;
}

export type IWorkspaceFilePreviewScreenProps = IWorkspaceFilePreviewScreenDataProps &
  IWorkspaceFilePreviewScreenEventProps &
  NativeStackScreenProps<WorkspaceNavigationParams, typeof workspaceRouteNames.filePreview>;
