import { NavigationInjectedProps } from 'react-navigation';
import { ThunkDispatch } from 'redux-thunk';

import { IFile } from '~/modules/workspace/reducer';

export interface IWorkspaceFilePreviewScreenDataProps {
  file: IFile;
  title: string;
}

export interface IWorkspaceFilePreviewScreenEventProps {
  downloadFile: (file: IFile) => void;
  previewFile: (file: IFile) => void;
  shareFile: (file: IFile) => void;
  dispatch: ThunkDispatch<any, any, any>;
}

export type IWorkspaceFilePreviewScreenProps = IWorkspaceFilePreviewScreenDataProps &
  IWorkspaceFilePreviewScreenEventProps &
  NavigationInjectedProps;
