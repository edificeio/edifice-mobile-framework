import { NavigationInjectedProps } from 'react-navigation';
import { ThunkDispatch } from 'redux-thunk';

import { IFile } from '~/modules/workspace/reducer';

export interface IWorkspaceFilePreviewScreenDataProps {
  file: IFile;
  title: string;
}

export interface IWorkspaceFilePreviewScreenEventProps {
  downloadFile: (file: IFile) => void;
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
  NavigationInjectedProps<IWorkspaceFilePreviewScreenNavigationParams>;
