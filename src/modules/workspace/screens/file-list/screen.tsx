import I18n from 'i18n-js';
import * as React from 'react';
import { useEffect, useState } from 'react';
import { Platform, RefreshControl } from 'react-native';
import { Asset } from 'react-native-image-picker';
import { NavigationActions } from 'react-navigation';
import { connect } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';

import { IGlobalState } from '~/AppStore';
import theme from '~/app/theme';
import { EmptyScreen } from '~/framework/components/emptyScreen';
import FlatList from '~/framework/components/flatList';
import { HeaderBackAction, HeaderIcon, HeaderTitle } from '~/framework/components/header';
import { PageView } from '~/framework/components/page';
import PopupMenu, { PopupMenuAction } from '~/framework/components/popup-menu';
import { cameraAction, deleteAction, documentAction, galleryAction } from '~/framework/components/popup-menu/actions';
import { LocalFile } from '~/framework/util/fileHandler';
import { computeRelativePath } from '~/framework/util/navigation';
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
import { WorkspaceModal, WorkspaceModalType } from '~/modules/workspace/components/WorkspaceModal';
import moduleConfig from '~/modules/workspace/moduleConfig';
import { Filter, IFile } from '~/modules/workspace/reducer';

import styles from './styles';
import { IWorkspaceFileListScreenEventProps, IWorkspaceFileListScreenProps } from './types';

const WorkspaceFileListScreen = (props: IWorkspaceFileListScreenProps) => {
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [modalType, setModalType] = useState<WorkspaceModalType>(WorkspaceModalType.NONE);
  const modalBoxRef: { current: any } = React.createRef();
  const isSelectionActive = selectedFiles.length > 0;

  const fetchFiles = (parentId: string = props.parentId, shouldRefreshFolderList?: boolean) => {
    props.fetchFiles(props.filter, parentId);
    if ((!props.folderTree.data.length && !props.folderTree.isFetching) || shouldRefreshFolderList) {
      props.listFolders();
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  const onGoBack = () => {
    if (isSelectionActive) {
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

  const getMenuActions = (): {
    navBarActions: { icon: string };
    popupMenuActions: PopupMenuAction[];
  } => {
    if (isSelectionActive) {
      const isFolderSelected = props.files.filter(file => selectedFiles.includes(file.id)).some(file => file.isFolder);
      const popupMenuActions = [
        ...(selectedFiles.length === 1 && props.filter === Filter.OWNER
          ? [
              {
                title: I18n.t('rename'),
                action: () => openModal(WorkspaceModalType.EDIT),
                iconIos: 'pencil',
                iconAndroid: 'ic_pencil',
              },
            ]
          : []),
        ...(props.filter !== Filter.TRASH
          ? [
              {
                title: I18n.t('copy'),
                action: () => openModal(WorkspaceModalType.DUPLICATE),
                iconIos: 'square.on.square',
                iconAndroid: 'ic_content_copy',
              },
            ]
          : []),
        ...(props.filter === Filter.OWNER
          ? [
              {
                title: I18n.t('move'),
                action: () => openModal(WorkspaceModalType.MOVE),
                iconIos: 'arrow.up.square',
                iconAndroid: 'ic_move_to_inbox',
              },
            ]
          : []),
        ...(props.filter === Filter.TRASH
          ? [
              {
                title: I18n.t('conversation.restore'),
                action: () => restoreSelectedFiles,
                iconIos: 'arrow.uturn.backward.circle',
                iconAndroid: 'ic_restore',
              },
            ]
          : []),
        ...(Platform.OS !== 'ios' && !isFolderSelected
          ? [
              {
                title: I18n.t('download'),
                action: () => openModal(WorkspaceModalType.DOWNLOAD),
                iconIos: 'square.and.arrow.down',
                iconAndroid: 'ic_download',
              },
            ]
          : []),
        ...((selectedFiles.length >= 1 && props.filter === Filter.OWNER) || props.filter === Filter.TRASH
          ? [
              deleteAction({
                action: () => openModal(props.filter === Filter.TRASH ? WorkspaceModalType.DELETE : WorkspaceModalType.TRASH),
              }),
            ]
          : []),
      ];
      return { navBarActions: { icon: 'more_vert' }, popupMenuActions };
    }
    if (props.filter === Filter.OWNER || (props.filter === Filter.SHARED && props.parentId !== Filter.SHARED)) {
      const popupMenuActions = [
        cameraAction({ callback: uploadFile }),
        galleryAction({ callback: uploadFile, multiple: true }),
        documentAction({ callback: uploadFile }),
        ...(props.filter === Filter.OWNER
          ? [
              {
                title: I18n.t('create-folder'),
                action: () => openModal(WorkspaceModalType.CREATE_FOLDER),
                iconIos: 'folder.badge.plus',
                iconAndroid: 'ic_create_new_folder',
              },
            ]
          : []),
      ];
      return { navBarActions: { icon: 'add' }, popupMenuActions };
    }
    return { navBarActions: { icon: '' }, popupMenuActions: [] };
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
    right: (
      <PopupMenu actions={menuActions.popupMenuActions}>
        <HeaderIcon name={menuActions.navBarActions.icon} iconSize={menuActions.navBarActions.icon === 'more_vert' ? 26 : 20} />
      </PopupMenu>
    ),
    style: {
      backgroundColor: theme.palette.primary.regular,
    },
  };

  const renderMenus = () => {
    const files = props.files.filter(file => selectedFiles.includes(file.id));
    return (
      <WorkspaceModal
        filter={props.filter}
        folderTree={props.folderTree.data}
        modalBoxRef={modalBoxRef}
        parentId={props.parentId}
        selectedFiles={files}
        type={modalType}
        onAction={onModalAction}
      />
    );
  };

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
) => IWorkspaceFileListScreenEventProps = (dispatch, getState) => ({
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
