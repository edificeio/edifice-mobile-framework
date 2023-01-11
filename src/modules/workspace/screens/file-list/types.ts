import { NavigationInjectedProps } from 'react-navigation';
import { ThunkDispatch } from 'redux-thunk';

import { LocalFile } from '~/framework/util/fileHandler';
import { AsyncPagedLoadingState } from '~/framework/util/redux/asyncPaged';
import { Filter, IFile, IFolder } from '~/modules/workspace/reducer';

export interface IWorkspaceFileListScreenDataProps {
  files: IFile[];
  filter: Filter;
  folderTree: IFolder[];
  initialLoadingState: AsyncPagedLoadingState;
  parentId: string;
}

export interface IWorkspaceFileListScreenEventProps {
  createFolder: (name: string, parentId: string) => void;
  deleteFiles: (parentId: string, ids: string[]) => void;
  downloadFiles: (files: IFile[]) => void;
  duplicateFiles: (parentId: string, ids: string[], destinationId: string) => void;
  fetchFiles: (filter: Filter, parentId: string) => void;
  listFolders: () => void;
  moveFiles: (parentId: string, ids: string[], destinationId: string) => void;
  previewFile: (file: IFile) => void;
  renameFile: (file: IFile, name: string) => void;
  restoreFiles: (parentId: string, ids: string[]) => void;
  trashFiles: (parentId: string, ids: string[]) => void;
  uploadFile: (parentId: string, lf: LocalFile) => void;
  dispatch: ThunkDispatch<any, any, any>;
}

export type IWorkspaceFileListScreenProps = IWorkspaceFileListScreenDataProps &
  IWorkspaceFileListScreenEventProps &
  NavigationInjectedProps;
