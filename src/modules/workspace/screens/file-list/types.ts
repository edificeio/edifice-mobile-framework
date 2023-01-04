import { NavigationInjectedProps } from 'react-navigation';
import { ThunkDispatch } from 'redux-thunk';

import { LocalFile } from '~/framework/util/fileHandler';
import { AsyncState } from '~/framework/util/redux/async';
import { IWorkspaceModalEventProps } from '~/modules/workspace/components/WorkspaceModal';
import { Filter, IFile, IFolder } from '~/modules/workspace/reducer';

export interface IWorkspaceFileListScreenDataProps {
  files: IFile[];
  filter: Filter;
  folderTree: AsyncState<IFolder[]>;
  isFetching: boolean;
  parentId: string;
}

export interface IWorkspaceFileListScreenEventProps {
  modalEvents: IWorkspaceModalEventProps;
  fetchFiles: (filter: Filter, parentId: string) => void;
  listFolders: () => void;
  previewFile: (file: IFile) => void;
  restoreFiles: (parentId: string, ids: string[]) => void;
  uploadFile: (parentId: string, lf: LocalFile) => void;
  dispatch: ThunkDispatch<any, any, any>;
}

export type IWorkspaceFileListScreenProps = IWorkspaceFileListScreenDataProps &
  IWorkspaceFileListScreenEventProps &
  NavigationInjectedProps;
