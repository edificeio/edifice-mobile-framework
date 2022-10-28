import I18n from 'i18n-js';
import * as React from 'react';
import { useEffect, useState } from 'react';
import { Platform, RefreshControl, StyleSheet } from 'react-native';
import { Asset } from 'react-native-image-picker';
import { NavigationActions, NavigationInjectedProps } from 'react-navigation';
import { connect } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';

import { IGlobalState } from '~/AppStore';
import theme from '~/app/theme';
import { EmptyScreen } from '~/framework/components/emptyScreen';
import FlatList from '~/framework/components/flatList';
import { HeaderAction, HeaderBackAction, HeaderTitle } from '~/framework/components/header';
import { PageView } from '~/framework/components/page';
import { LocalFile } from '~/framework/util/fileHandler';
import { computeRelativePath } from '~/framework/util/navigation';
import { AsyncState } from '~/framework/util/redux/async';
import { getUserSession } from '~/framework/util/session';
import { DocumentPicked } from '~/infra/filePicker';
import {
  copyWorkspaceFilesAction,
  createWorkspaceFolderAction,
  deleteWorkspaceFilesAction,
  downloadThenOpenWorkspaceFileAction,
  downloadWorkspaceFilesAction,
  fetchWorkspaceFilesAction,
  listWorkspaceFoldersAction,
  moveWorkspaceFilesAction,
  renameWorkspaceFileAction,
  restoreWorkspaceFilesAction,
  trashWorkspaceFilesAction,
  uploadWorkspaceFileAction,
} from '~/modules/workspace/actions';
import { WorkspaceFileListItem } from '~/modules/workspace/components/WorkspaceFileListItem';
import { IWorkspaceModalEventProps, WorkspaceModal, WorkspaceModalType } from '~/modules/workspace/components/WorkspaceModal';
import moduleConfig from '~/modules/workspace/moduleConfig';
import { Filter, IFile, IFolder } from '~/modules/workspace/reducer';
import { DropdownMenu, DropdownMenuAction } from '~/ui/DropdownMenu';

const styles = StyleSheet.create({
  listContainer: {
    backgroundColor: theme.palette.grey.fog,
    flexGrow: 1,
  },
});

// TYPES ==========================================================================================

interface IWorkspaceFileListScreen_DataProps {
  files: IFile[];
  filter: Filter;
  folderTree: AsyncState<IFolder[]>;
  isFetching: boolean;
  parentId: string;
}

interface IWorkspaceFileListScreen_EventProps {
  modalEvents: IWorkspaceModalEventProps;
  fetchFiles: (filter: Filter, parentId: string) => void;
  listFolders: () => void;
  previewFile: (file: IFile) => void;
  restoreFiles: (parentId: string, ids: string[]) => void;
  uploadFile: (parentId: string, lf: LocalFile) => void;
  dispatch: ThunkDispatch<any, any, any>;
}

type IWorkspaceFileListScreen_Props = IWorkspaceFileListScreen_DataProps &
  IWorkspaceFileListScreen_EventProps &
  NavigationInjectedProps;

// COMPONENT ======================================================================================

const WorkspaceFileListScreen = (props: IWorkspaceFileListScreen_Props) => {
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [isDropdownVisible, setDropdownVisible] = useState<boolean>(false);
  const [modalType, setModalType] = useState<WorkspaceModalType>(WorkspaceModalType.NONE);
  const modalBoxRef: { current: any } = React.createRef();
  const isSelectionActive = selectedFiles.length > 0;

  // LOADER =======================================================================================

  const fetchFiles = (parentId: string = props.parentId, shouldRefreshFolderList?: boolean) => {
    props.fetchFiles(props.filter, parentId);
    if ((!props.folderTree.data.length && !props.folderTree.isFetching) || shouldRefreshFolderList) {
      props.listFolders();
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  // EVENTS =======================================================================================

  const onGoBack = () => {
    if (isDropdownVisible) {
      setDropdownVisible(false);
      return false;
    } else if (isSelectionActive) {
      setSelectedFiles([]);
      return false;
    }
    return true;
  };

  const onPressBackAction = () => {
    if (onGoBack()) {
      props.navigation.dispatch(NavigationActions.back());
    }
  };

  const showDropdown = () => {
    setDropdownVisible(!isDropdownVisible);
  };

  const openModal = (type: WorkspaceModalType) => {
    setModalType(type);
    modalBoxRef?.current?.doShowModal();
  };

  const selectFile = (file: IFile) => {
    if (selectedFiles.includes(file.id)) {
      setSelectedFiles(selectedFiles.filter(id => id !== file.id));
    } else {
      setSelectedFiles(selected => [...selected, file.id]);
    }
  };

  const onPressFile = (file: IFile) => {
    if (Platform.OS === 'ios' && !isSelectionActive && !file.isFolder) {
      return props.previewFile(file);
    } else if (isSelectionActive) {
      return selectFile(file);
    }
    const { id, name: title, isFolder } = file;
    if (isFolder) {
      const filter = props.filter === Filter.ROOT ? id : props.filter;
      props.navigation.push(computeRelativePath(moduleConfig.routeName, props.navigation.state), { filter, parentId: id, title });
    } else {
      props.navigation.navigate(computeRelativePath(`${moduleConfig.routeName}/details`, props.navigation.state), { file, title });
    }
  };

  const uploadFile = async (file: Asset | DocumentPicked) => {
    const lf = new LocalFile(file, { _needIOSReleaseSecureAccess: false });
    await props.uploadFile(props.parentId, lf);
    props.fetchFiles(props.filter, props.parentId);
  };

  const restoreSelectedFiles = async () => {
    setSelectedFiles([]);
    props.restoreFiles(props.parentId, selectedFiles);
    props.fetchFiles(props.filter, props.parentId);
  };

  const onModalAction = (files: IFile[], value: string, destinationId: string) => {
    const { parentId } = props;
    setSelectedFiles([]);
    modalBoxRef?.current?.doDismissModal();
    switch (modalType) {
      case WorkspaceModalType.CREATE_FOLDER:
        props.modalEvents.createFolder(value, parentId);
        return fetchFiles(parentId, true);
      case WorkspaceModalType.DELETE:
        props.modalEvents.deleteFiles(parentId, files);
        return fetchFiles(parentId, true);
      case WorkspaceModalType.DOWNLOAD:
        return props.modalEvents.downloadFiles(files);
      case WorkspaceModalType.DUPLICATE:
        props.modalEvents.duplicateFiles(parentId, files, destinationId);
        return fetchFiles(destinationId, true);
      case WorkspaceModalType.EDIT:
        props.modalEvents.renameFile(files[0], value);
        return fetchFiles(parentId, true);
      case WorkspaceModalType.MOVE:
        props.modalEvents.moveFiles(parentId, files, destinationId);
        props.fetchFiles(props.filter, destinationId);
        return fetchFiles(parentId, true);
      case WorkspaceModalType.TRASH:
        props.modalEvents.trashFiles(parentId, files);
        return fetchFiles(parentId, true);
    }
  };

  // HEADER =======================================================================================

  const getMenuActions = (): {
    navBarActions: { icon: string; onPress: () => void }[];
    dropdownActions: DropdownMenuAction[];
  } => {
    if (isSelectionActive) {
      const isFolderSelected = props.files.filter(file => selectedFiles.includes(file.id)).some(file => file.isFolder);
      const actions = [
        ...(selectedFiles.length === 1 && props.filter === Filter.OWNER
          ? [{ text: I18n.t('rename'), icon: 'pencil', onPress: () => openModal(WorkspaceModalType.EDIT) }]
          : []),
        ...((selectedFiles.length > 1 && props.filter === Filter.OWNER) || props.filter === Filter.TRASH
          ? [
              {
                text: I18n.t('delete'),
                icon: 'delete',
                onPress: () => openModal(props.filter === Filter.TRASH ? WorkspaceModalType.DELETE : WorkspaceModalType.TRASH),
              },
            ]
          : []),
        ...(props.filter !== Filter.TRASH
          ? [{ text: I18n.t('copy'), icon: 'content-copy', onPress: () => openModal(WorkspaceModalType.DUPLICATE) }]
          : []),
        ...(props.filter === Filter.OWNER
          ? [{ text: I18n.t('move'), icon: 'package-up', onPress: () => openModal(WorkspaceModalType.MOVE) }]
          : []),
        ...(props.filter === Filter.TRASH
          ? [{ text: I18n.t('conversation.restore'), icon: 'restore', onPress: restoreSelectedFiles }]
          : []),
        ...(Platform.OS !== 'ios' && !isFolderSelected
          ? [{ text: I18n.t('download'), icon: 'download', onPress: () => openModal(WorkspaceModalType.DOWNLOAD) }]
          : []),
        ...(selectedFiles.length === 1 && props.filter === Filter.OWNER
          ? [
              {
                text: I18n.t('delete'),
                icon: 'delete',
                onPress: () => openModal(props.filter === Filter.TRASH ? WorkspaceModalType.DELETE : WorkspaceModalType.TRASH),
              },
            ]
          : []),
      ];
      if (actions.length > 2) {
        const firstAction = actions[0] as { icon: string; onPress: () => void };
        const navBarActions = [firstAction, { icon: 'more_vert', onPress: showDropdown }];
        return { navBarActions, dropdownActions: actions.slice(1) };
      }
      return { navBarActions: actions, dropdownActions: [] };
    }
    if (props.filter === Filter.OWNER || (props.filter === Filter.SHARED && props.parentId !== Filter.SHARED)) {
      const navBarActions = [{ icon: isDropdownVisible ? 'close' : 'add', onPress: showDropdown }];
      const dropdownActions = [
        { text: I18n.t('add-file'), icon: 'file-plus', isFilePicker: true, onPress: () => true, onFilePick: uploadFile },
        ...(props.filter === Filter.OWNER
          ? [{ text: I18n.t('create-folder'), icon: 'added_files', onPress: () => openModal(WorkspaceModalType.CREATE_FOLDER) }]
          : []),
      ];
      return { navBarActions, dropdownActions };
    }
    return { navBarActions: [], dropdownActions: [] };
  };

  const menuActions = getMenuActions();
  const navBarInfo = {
    left: (
      <>
        <HeaderBackAction onPress={onPressBackAction} />
        {isSelectionActive ? <HeaderTitle>{selectedFiles.length}</HeaderTitle> : null}
      </>
    ),
    title: isSelectionActive ? null : props.navigation.getParam('title'),
    right: menuActions.navBarActions.map(action => (
      <HeaderAction iconName={action.icon} iconSize={isSelectionActive ? 24 : 20} onPress={action.onPress} />
    )),
    style: {
      backgroundColor: isSelectionActive ? theme.palette.secondary.regular : theme.palette.primary.regular,
    },
  };

  // MENUS ========================================================================================

  const renderMenus = () => {
    const dropdownColor = isSelectionActive ? theme.palette.secondary.regular : theme.palette.primary.regular;
    const files = props.files.filter(file => selectedFiles.includes(file.id));
    return (
      <>
        <DropdownMenu
          data={menuActions.dropdownActions}
          isVisible={isDropdownVisible}
          color={dropdownColor}
          onTapOutside={showDropdown}
        />
        <WorkspaceModal
          filter={props.filter}
          folderTree={props.folderTree.data}
          modalBoxRef={modalBoxRef}
          parentId={props.parentId}
          selectedFiles={files}
          type={modalType}
          onAction={onModalAction}
        />
      </>
    );
  };

  // EMPTY SCREEN =================================================================================

  const renderEmpty = () => {
    if (props.isFetching) return null;
    const image = props.parentId === Filter.TRASH ? 'empty-trash' : 'empty-workspace';
    const screen = Object.values(Filter).includes(props.parentId as Filter) ? props.parentId : 'subfolder';
    return (
      <EmptyScreen
        svgImage={image}
        title={I18n.t(`workspace.emptyScreen.${screen}.title`)}
        text={I18n.t(`workspace.emptyScreen.${screen}.text`)}
      />
    );
  };

  // RENDER =======================================================================================

  return (
    <PageView navigation={props.navigation} navBar={navBarInfo} onBack={onGoBack}>
      <FlatList
        data={props.files}
        renderItem={({ item }) => (
          <WorkspaceFileListItem
            item={item}
            isSelected={selectedFiles.includes(item.id)}
            onPress={onPressFile}
            onLongPress={selectFile}
          />
        )}
        keyExtractor={(item: IFile) => item.id}
        refreshControl={<RefreshControl refreshing={props.isFetching} onRefresh={fetchFiles} />}
        ListEmptyComponent={renderEmpty()}
        contentContainerStyle={styles.listContainer}
      />
      {renderMenus()}
    </PageView>
  );
};

// MAPPING ========================================================================================

const mapStateToProps = (gs: any, props: any) => {
  const state = moduleConfig.getState(gs);
  const parentId = props.navigation.getParam('parentId');

  return {
    files: state.directories.data[parentId] || [],
    filter: props.navigation.getParam('filter'),
    folderTree: state.folderTree,
    isFetching: state.directories.isFetching || !state.directories.data[parentId],
    parentId,
    session: getUserSession(),
  };
};

const mapDispatchToProps: (
  dispatch: ThunkDispatch<any, any, any>,
  getState: () => IGlobalState,
) => IWorkspaceFileListScreen_EventProps = (dispatch, getState) => ({
  modalEvents: {
    createFolder: async (name: string, parentId: string) => {
      return dispatch(createWorkspaceFolderAction(name, parentId));
    },
    deleteFiles: async (parentId: string, files: IFile[]) => {
      const ids = files.map(file => file.id);
      return dispatch(deleteWorkspaceFilesAction(parentId, ids));
    },
    downloadFiles: async (files: IFile[]) => {
      return dispatch(downloadWorkspaceFilesAction(files));
    },
    duplicateFiles: async (parentId: string, files: IFile[], destinationId: string) => {
      const ids = files.map(file => file.id);
      return dispatch(copyWorkspaceFilesAction(parentId, ids, destinationId));
    },
    moveFiles: async (parentId: string, files: IFile[], destinationId: string) => {
      const ids = files.map(file => file.id);
      return dispatch(moveWorkspaceFilesAction(parentId, ids, destinationId));
    },
    renameFile: async (file: IFile, name: string) => {
      return dispatch(renameWorkspaceFileAction(file, name));
    },
    trashFiles: async (parentId: string, files: IFile[]) => {
      const ids = files.map(file => file.id);
      return dispatch(trashWorkspaceFilesAction(parentId, ids));
    },
  },
  fetchFiles: async (filter: Filter, parentId: string) => {
    return dispatch(fetchWorkspaceFilesAction(filter, parentId));
  },
  listFolders: async () => {
    return dispatch(listWorkspaceFoldersAction());
  },
  previewFile: async (file: IFile) => {
    return dispatch(downloadThenOpenWorkspaceFileAction(file));
  },
  restoreFiles: async (parentId: string, ids: string[]) => {
    return dispatch(restoreWorkspaceFilesAction(parentId, ids));
  },
  uploadFile: async (parentId: string, lf: LocalFile) => {
    return dispatch(uploadWorkspaceFileAction(parentId, lf));
  },
  dispatch,
});

export default connect(mapStateToProps, mapDispatchToProps)(WorkspaceFileListScreen);
