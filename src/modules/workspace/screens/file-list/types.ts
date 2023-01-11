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
  createFolder: (name: string, parentId: string) => Promise<void>;
  deleteFiles: (parentId: string, ids: string[]) => Promise<void>;
  downloadFiles: (files: IFile[]) => Promise<void>;
  duplicateFiles: (parentId: string, ids: string[], destinationId: string) => Promise<void>;
  fetchFiles: (filter: Filter, parentId: string) => Promise<IFile[]>;
  listFolders: () => Promise<IFolder[]>;
  moveFiles: (parentId: string, ids: string[], destinationId: string) => Promise<void>;
  previewFile: (file: IFile) => Promise<void>;
  renameFile: (file: IFile, name: string) => Promise<void>;
  restoreFiles: (parentId: string, ids: string[]) => Promise<void>;
  trashFiles: (parentId: string, ids: string[]) => Promise<void>;
  uploadFile: (parentId: string, lf: LocalFile) => Promise<void>;
  dispatch: ThunkDispatch<any, any, any>;
}

export type IWorkspaceFileListScreenProps = IWorkspaceFileListScreenDataProps &
  IWorkspaceFileListScreenEventProps &
  NavigationInjectedProps;
