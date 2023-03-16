import type { NativeStackNavigationOptions, NativeStackScreenProps } from '@react-navigation/native-stack';
import I18n from 'i18n-js';
import * as React from 'react';
import { Platform, RefreshControl, View } from 'react-native';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { ThunkDispatch } from 'redux-thunk';

import { IGlobalState } from '~/app/store';
import theme from '~/app/theme';
import { ModalBoxHandle } from '~/framework/components/ModalBox';
import { EmptyContentScreen } from '~/framework/components/emptyContentScreen';
import { EmptyScreen } from '~/framework/components/emptyScreen';
import { LoadingIndicator } from '~/framework/components/loading';
import { MenuAction, cameraAction, deleteAction, documentAction, galleryAction } from '~/framework/components/menus/actions';
import PopupMenu from '~/framework/components/menus/popup';
import { PageView } from '~/framework/components/page';
import ScrollView from '~/framework/components/scrollView';
import SwipeableList from '~/framework/components/swipeableList';
import { getSession } from '~/framework/modules/auth/reducer';
import {
  convertIFileToIDistantFile,
  copyWorkspaceFilesAction,
  deleteWorkspaceFilesAction,
  downloadThenOpenWorkspaceFileAction,
  downloadWorkspaceFilesAction,
  fetchWorkspaceFilesAction,
  moveWorkspaceFilesAction,
  renameWorkspaceFileAction,
  restoreWorkspaceFilesAction,
  trashWorkspaceFilesAction,
  uploadWorkspaceFileAction,
} from '~/framework/modules/workspace/actions/fileTransfer';
import { createWorkspaceFolderAction, listWorkspaceFoldersAction } from '~/framework/modules/workspace/actions/folder';
import { WorkspaceFileListItem } from '~/framework/modules/workspace/components/WorkspaceFileListItem';
import WorkspaceModal, { WorkspaceModalType } from '~/framework/modules/workspace/components/WorkspaceModal';
import moduleConfig from '~/framework/modules/workspace/module-config';
import { WorkspaceNavigationParams, workspaceRouteNames } from '~/framework/modules/workspace/navigation';
import { Filter, IFile } from '~/framework/modules/workspace/reducer';
import { NavBarAction, navBarOptions } from '~/framework/navigation/navBar';
import { LocalFile } from '~/framework/util/fileHandler';
import { openDocument } from '~/framework/util/fileHandler/actions';
import { computeRelativePath } from '~/framework/util/navigation';
import { tryAction } from '~/framework/util/redux/actions';
import { AsyncPagedLoadingState } from '~/framework/util/redux/asyncPaged';

import styles from './styles';
import { IWorkspaceFileListScreenProps } from './types';

export const computeNavBar = ({
  navigation,
  route,
}: NativeStackScreenProps<WorkspaceNavigationParams, typeof workspaceRouteNames.home>): NativeStackNavigationOptions => ({
  ...navBarOptions({
    navigation,
    route,
  }),
  title: I18n.t('workspace.tabName'),
});

const WorkspaceFileListScreen = (props: IWorkspaceFileListScreenProps) => {
  const filter = props.route.params.filter;
  const parentId = props.route.params.parentId;
  const [selectedFiles, setSelectedFiles] = React.useState<string[]>([]);
  const [isUploading, setUploading] = React.useState(false);
  const [modalType, setModalType] = React.useState<WorkspaceModalType>(WorkspaceModalType.NONE);
  const modalBoxRef = React.useRef<ModalBoxHandle>(null);
  const isSelectionActive = selectedFiles.length > 0;

  const [loadingState, setLoadingState] = React.useState(props.initialLoadingState ?? AsyncPagedLoadingState.PRISTINE);
  const loadingRef = React.useRef<AsyncPagedLoadingState>();
  loadingRef.current = loadingState;
  // /!\ Need to use Ref of the state because of hooks Closure issue. @see https://stackoverflow.com/a/56554056/6111343

  const fetchList = async (id: string = parentId, shouldRefreshFolderList?: boolean) => {
    try {
      const { fetchFiles, listFolders, folderTree } = props;
      await fetchFiles(filter, id);
      if (!folderTree.length || shouldRefreshFolderList) {
        await listFolders();
      }
    } catch {
      throw new Error();
    }
  };

  const init = () => {
    setLoadingState(AsyncPagedLoadingState.INIT);
    fetchList()
      .then(() => setLoadingState(AsyncPagedLoadingState.DONE))
      .catch(() => setLoadingState(AsyncPagedLoadingState.INIT_FAILED));
  };

  const reload = () => {
    setLoadingState(AsyncPagedLoadingState.RETRY);
    fetchList()
      .then(() => setLoadingState(AsyncPagedLoadingState.DONE))
      .catch(() => setLoadingState(AsyncPagedLoadingState.INIT_FAILED));
  };

  const refresh = () => {
    setLoadingState(AsyncPagedLoadingState.REFRESH);
    fetchList()
      .then(() => setLoadingState(AsyncPagedLoadingState.DONE))
      .catch(() => setLoadingState(AsyncPagedLoadingState.REFRESH_FAILED));
  };

  const fetchOnNavigation = () => {
    if (loadingRef.current === AsyncPagedLoadingState.PRISTINE) init();
  };

  React.useEffect(() => {
    const unsubscribe = props.navigation.addListener('focus', () => {
      fetchOnNavigation();
    });
    return unsubscribe;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.navigation]);

  const openModal = (type: WorkspaceModalType) => {
    setModalType(type);
    modalBoxRef.current?.doShowModal();
  };

  const selectFile = (file: IFile) => {
    if (selectedFiles.includes(file.id)) {
      setSelectedFiles(selectedFiles.filter(id => id !== file.id));
    } else {
      setSelectedFiles(selected => [...selected, file.id]);
    }
  };

  const openMedia = (file: IFile) => {
    const { /*files, */ navigation } = props;
    // const data = files
    //   .filter(f => f.contentType?.startsWith('image'))
    //   .map(f => ({
    //     type: 'image',
    //     src: { uri: f.url },
    //     link: f.url,
    //   })) as IMedia[];
    // const startIndex = data.findIndex(f => f.link === file.url);
    // openCarousel({ data, startIndex }, navigation)
    openDocument(convertIFileToIDistantFile(file), navigation);
  };

  const onPressFile = (file: IFile) => {
    if (isSelectionActive) {
      return selectFile(file);
    }
    if (file.contentType?.startsWith('image')) {
      return openMedia(file);
    }
    if (Platform.OS === 'ios' && !file.isFolder) {
      return props.previewFile(file, props.navigation);
    }
    const { navigation } = props;
    const { id, name: title, isFolder } = file;
    if (isFolder) {
      const newFilter = filter === Filter.ROOT ? id : filter;
      navigation.push(computeRelativePath(moduleConfig.routeName), { filter: newFilter, parentId: id, title });
    } else {
      navigation.navigate(computeRelativePath(`${moduleConfig.routeName}/file-preview`), { file, title });
    }
  };

  const uploadFile = async file => {
    setUploading(true);
    await props.uploadFile(parentId, new LocalFile(file, { _needIOSReleaseSecureAccess: false }));
    setUploading(false);
    fetchList();
  };

  const restoreSelectedFiles = async () => {
    const ids = selectedFiles;
    setSelectedFiles([]);
    props.restoreFiles(parentId, ids);
    fetchList();
  };

  const onModalAction = async (files: IFile[], value: string, destinationId: string) => {
    const ids = files.map(f => f.id);
    setSelectedFiles([]);
    modalBoxRef.current?.doDismissModal();
    switch (modalType) {
      case WorkspaceModalType.CREATE_FOLDER:
        await props.createFolder(value, parentId);
        return fetchList(parentId, true);
      case WorkspaceModalType.DELETE:
        await props.deleteFiles(parentId, ids);
        return fetchList(parentId, true);
      case WorkspaceModalType.DOWNLOAD:
        return props.downloadFiles(files);
      case WorkspaceModalType.DUPLICATE:
        await props.duplicateFiles(parentId, ids, destinationId);
        return fetchList(destinationId, true);
      case WorkspaceModalType.EDIT:
        await props.renameFile(files[0], value);
        return fetchList(parentId, true);
      case WorkspaceModalType.MOVE:
        await props.moveFiles(parentId, ids, destinationId);
        fetchList(destinationId);
        return fetchList(parentId, true);
      case WorkspaceModalType.TRASH:
        await props.trashFiles(parentId, ids);
        return fetchList(parentId, true);
    }
  };

  const getMenuActions = (): {
    navBarActions: { icon: string };
    popupMenuActions: MenuAction[];
  } => {
    if (isSelectionActive) {
      const isFolderSelected = props.files.filter(file => selectedFiles.includes(file.id)).some(file => file.isFolder);
      const popupMenuActions = [
        ...(selectedFiles.length === 1 && filter === Filter.OWNER
          ? [
              {
                title: I18n.t('rename'),
                action: () => openModal(WorkspaceModalType.EDIT),
                icon: {
                  ios: 'pencil',
                  android: 'ic_pencil',
                },
              },
            ]
          : []),
        ...(filter !== Filter.TRASH
          ? [
              {
                title: I18n.t('copy'),
                action: () => openModal(WorkspaceModalType.DUPLICATE),
                icon: {
                  ios: 'square.on.square',
                  android: 'ic_content_copy',
                },
              },
            ]
          : []),
        ...(filter === Filter.OWNER
          ? [
              {
                title: I18n.t('move'),
                action: () => openModal(WorkspaceModalType.MOVE),
                icon: {
                  ios: 'arrow.up.square',
                  android: 'ic_move_to_inbox',
                },
              },
            ]
          : []),
        ...(filter === Filter.TRASH
          ? [
              {
                title: I18n.t('conversation.restore'),
                action: () => restoreSelectedFiles,
                icon: {
                  ios: 'arrow.uturn.backward.circle',
                  android: 'ic_restore',
                },
              },
            ]
          : []),
        ...(Platform.OS !== 'ios' && !isFolderSelected
          ? [
              {
                title: I18n.t('download'),
                action: () => openModal(WorkspaceModalType.DOWNLOAD),
                icon: {
                  ios: 'square.and.arrow.down',
                  android: 'ic_download',
                },
              },
            ]
          : []),
        ...((selectedFiles.length >= 1 && filter === Filter.OWNER) || filter === Filter.TRASH
          ? [
              deleteAction({
                action: () => openModal(filter === Filter.TRASH ? WorkspaceModalType.DELETE : WorkspaceModalType.TRASH),
              }),
            ]
          : []),
      ];
      return { navBarActions: { icon: 'ui-options' }, popupMenuActions };
    }
    if (filter === Filter.OWNER || (filter === Filter.SHARED && parentId !== Filter.SHARED)) {
      const popupMenuActions = [
        cameraAction({ callback: uploadFile }),
        galleryAction({ callback: uploadFile, multiple: true }),
        documentAction({ callback: uploadFile }),
        ...(filter === Filter.OWNER
          ? [
              {
                title: I18n.t('create-folder'),
                action: () => openModal(WorkspaceModalType.CREATE_FOLDER),
                icon: {
                  ios: 'folder.badge.plus',
                  android: 'ic_create_new_folder',
                },
              },
            ]
          : []),
      ];
      return { navBarActions: { icon: 'ui-plus' }, popupMenuActions };
    }
    return { navBarActions: { icon: '' }, popupMenuActions: [] };
  };

  const menuActions = getMenuActions();

  React.useEffect(() => {
    props.navigation.setOptions({
      // eslint-disable-next-line react/no-unstable-nested-components
      headerRight: () => (
        <PopupMenu actions={menuActions.popupMenuActions}>
          <NavBarAction iconName={menuActions.navBarActions.icon} />
        </PopupMenu>
      ),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [parentId, isSelectionActive, selectedFiles]);

  React.useEffect(() => {
    props.navigation.setOptions({
      title: props.route.params.title ?? I18n.t('workspace.tabName'),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [parentId]);

  const renderEmpty = () => {
    const image = parentId === Filter.TRASH ? 'empty-trash' : 'empty-workspace';
    const screen = Object.values(Filter).includes(parentId as Filter) ? parentId : 'subfolder';
    return (
      <EmptyScreen
        svgImage={image}
        title={I18n.t(`workspace.emptyScreen.${screen}.title`)}
        text={I18n.t(`workspace.emptyScreen.${screen}.text`)}
      />
    );
  };

  const renderError = () => {
    return (
      <ScrollView
        refreshControl={<RefreshControl refreshing={loadingState === AsyncPagedLoadingState.RETRY} onRefresh={() => reload()} />}>
        <EmptyContentScreen />
      </ScrollView>
    );
  };

  const renderModal = () => {
    const files = props.files.filter(file => selectedFiles.includes(file.id));
    return (
      <WorkspaceModal
        filter={filter}
        folderTree={props.folderTree}
        ref={modalBoxRef}
        parentId={parentId}
        selectedFiles={files}
        type={modalType}
        onAction={onModalAction}
      />
    );
  };

  const renderFileList = () => {
    return (
      <>
        <SwipeableList
          data={props.files}
          keyExtractor={(item: IFile) => item.id}
          renderItem={({ item }) => (
            <WorkspaceFileListItem
              item={item}
              isSelected={selectedFiles.includes(item.id)}
              onPress={onPressFile}
              onLongPress={selectFile}
            />
          )}
          refreshControl={<RefreshControl refreshing={loadingState === AsyncPagedLoadingState.REFRESH} onRefresh={refresh} />}
          ListEmptyComponent={renderEmpty()}
          contentContainerStyle={styles.listContainer}
          bottomInset
          rightOpenValue={-140}
          leftOpenValue={140}
          swipeActionWidth={140}
          itemSwipeActionProps={({ item }) => ({
            left:
              filter === Filter.TRASH
                ? [
                    {
                      action: async row => {
                        if (selectedFiles.includes(item.key)) {
                          selectFile(item);
                        }
                        props.restoreFiles(parentId, [item.key]).then(() => fetchList(parentId, true));
                        row[item.key]?.closeRow();
                      },
                      backgroundColor: theme.palette.status.success.regular,
                      actionText: I18n.t('conversation.restore'),
                      actionIcon: 'ui-unarchive',
                    },
                  ]
                : [],
            right:
              filter === Filter.OWNER
                ? [
                    {
                      action: async row => {
                        if (selectedFiles.includes(item.key)) {
                          selectFile(item);
                        }
                        props.trashFiles(parentId, [item.key]).then(() => fetchList(parentId, true));
                        row[item.key]?.closeRow();
                      },
                      backgroundColor: theme.palette.status.failure.regular,
                      actionText: I18n.t('delete'),
                      actionIcon: 'ui-trash',
                    },
                  ]
                : filter === Filter.TRASH
                ? [
                    {
                      action: async row => {
                        if (selectedFiles.includes(item.key)) {
                          selectFile(item);
                        }
                        props.deleteFiles(parentId, [item.key]).then(() => fetchList(parentId, true));
                        row[item.key]?.closeRow();
                      },
                      backgroundColor: theme.palette.status.failure.regular,
                      actionText: I18n.t('delete'),
                      actionIcon: 'ui-trash',
                    },
                  ]
                : [],
          })}
        />
        {isUploading ? (
          <View style={styles.uploadIndicatorContainer}>
            <LoadingIndicator />
          </View>
        ) : null}
        {renderModal()}
      </>
    );
  };

  const renderPage = () => {
    switch (loadingState) {
      case AsyncPagedLoadingState.DONE:
      case AsyncPagedLoadingState.REFRESH:
      case AsyncPagedLoadingState.REFRESH_FAILED:
      case AsyncPagedLoadingState.REFRESH_SILENT:
        return renderFileList();
      case AsyncPagedLoadingState.PRISTINE:
      case AsyncPagedLoadingState.INIT:
        return <LoadingIndicator />;
      case AsyncPagedLoadingState.INIT_FAILED:
      case AsyncPagedLoadingState.RETRY:
        return renderError();
    }
  };

  return <PageView>{renderPage()}</PageView>;
};

export default connect(
  (gs: IGlobalState, props: any) => {
    const state = moduleConfig.getState(gs);
    const parentId = props.route.params.parentId;
    return {
      files: state.directories.data[parentId] ?? [],
      folderTree: state.folderTree.data,
      initialLoadingState:
        state.directories[parentId] === undefined ? AsyncPagedLoadingState.PRISTINE : AsyncPagedLoadingState.DONE,
      session: getSession(gs),
    };
  },
  (dispatch: ThunkDispatch<any, any, any>) =>
    bindActionCreators(
      {
        createFolder: tryAction(
          createWorkspaceFolderAction,
          undefined,
          true,
        ) as unknown as IWorkspaceFileListScreenProps['createFolder'],
        deleteFiles: tryAction(
          deleteWorkspaceFilesAction,
          undefined,
          true,
        ) as unknown as IWorkspaceFileListScreenProps['deleteFiles'],
        downloadFiles: tryAction(
          downloadWorkspaceFilesAction,
          undefined,
          true,
        ) as unknown as IWorkspaceFileListScreenProps['downloadFiles'],
        duplicateFiles: tryAction(
          copyWorkspaceFilesAction,
          undefined,
          true,
        ) as unknown as IWorkspaceFileListScreenProps['duplicateFiles'],
        fetchFiles: tryAction(fetchWorkspaceFilesAction, undefined, true) as unknown as IWorkspaceFileListScreenProps['fetchFiles'],
        listFolders: tryAction(
          listWorkspaceFoldersAction,
          undefined,
          true,
        ) as unknown as IWorkspaceFileListScreenProps['listFolders'],
        moveFiles: tryAction(moveWorkspaceFilesAction, undefined, true) as unknown as IWorkspaceFileListScreenProps['moveFiles'],
        previewFile: tryAction(
          downloadThenOpenWorkspaceFileAction,
          undefined,
          true,
        ) as unknown as IWorkspaceFileListScreenProps['previewFile'],
        renameFile: tryAction(renameWorkspaceFileAction, undefined, true) as unknown as IWorkspaceFileListScreenProps['renameFile'],
        restoreFiles: tryAction(
          restoreWorkspaceFilesAction,
          undefined,
          true,
        ) as unknown as IWorkspaceFileListScreenProps['restoreFiles'],
        trashFiles: tryAction(trashWorkspaceFilesAction, undefined, true) as unknown as IWorkspaceFileListScreenProps['trashFiles'],
        uploadFile: tryAction(uploadWorkspaceFileAction, undefined, true) as unknown as IWorkspaceFileListScreenProps['uploadFile'],
      },
      dispatch,
    ),
)(WorkspaceFileListScreen);