import I18n from 'i18n-js';
import * as React from 'react';
import { Platform, RefreshControl, View } from 'react-native';
import { Asset } from 'react-native-image-picker';
import { NavigationActions, NavigationEventSubscription } from 'react-navigation';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { ThunkDispatch } from 'redux-thunk';

import { IGlobalState } from '~/AppStore';
import theme from '~/app/theme';
import { openCarousel } from '~/framework/components/carousel';
import { EmptyContentScreen } from '~/framework/components/emptyContentScreen';
import { EmptyScreen } from '~/framework/components/emptyScreen';
import { HeaderBackAction, HeaderIcon, HeaderTitle } from '~/framework/components/header';
import { LoadingIndicator } from '~/framework/components/loading';
import { PageView } from '~/framework/components/page';
import PopupMenu, {
  DocumentPicked,
  PopupMenuAction,
  cameraAction,
  deleteAction,
  documentAction,
  galleryAction,
} from '~/framework/components/popup-menu';
import ScrollView from '~/framework/components/scrollView';
import SwipeableList from '~/framework/components/swipeableList';
import { LocalFile } from '~/framework/util/fileHandler';
import { IMedia } from '~/framework/util/media';
import { computeRelativePath } from '~/framework/util/navigation';
import { tryAction } from '~/framework/util/redux/actions';
import { AsyncPagedLoadingState } from '~/framework/util/redux/asyncPaged';
import { getUserSession } from '~/framework/util/session';
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
import { IWorkspaceFileListScreenProps } from './types';

const WorkspaceFileListScreen = (props: IWorkspaceFileListScreenProps) => {
  const filter = props.navigation.getParam('filter');
  const parentId = props.navigation.getParam('parentId');
  const [selectedFiles, setSelectedFiles] = React.useState<string[]>([]);
  const [isUploading, setUploading] = React.useState(false);
  const [modalType, setModalType] = React.useState<WorkspaceModalType>(WorkspaceModalType.NONE);
  const modalBoxRef: { current: any } = React.createRef();
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
    } catch (e) {
      throw e;
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

  const focusEventListener = React.useRef<NavigationEventSubscription>();
  React.useEffect(() => {
    focusEventListener.current = props.navigation.addListener('didFocus', () => {
      fetchOnNavigation();
    });
    return () => {
      focusEventListener.current?.remove();
    };
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

  const openMedia = (file: IFile) => {
    const { files, navigation } = props;
    const data = files
      .filter(f => f.contentType?.startsWith('image'))
      .map(f => ({
        type: 'image',
        src: { uri: f.url },
        link: f.url,
      })) as IMedia[];
    const startIndex = data.findIndex(f => f.link === file.url);
    openCarousel({ data, startIndex }, navigation);
  };

  const onPressFile = (file: IFile) => {
    if (isSelectionActive) {
      return selectFile(file);
    }
    if (file.contentType?.startsWith('image')) {
      return openMedia(file);
    }
    if (Platform.OS === 'ios' && !file.isFolder) {
      return props.previewFile(file);
    }
    const { navigation } = props;
    const { id, name: title, isFolder } = file;
    if (isFolder) {
      const newFilter = filter === Filter.ROOT ? id : filter;
      navigation.push(computeRelativePath(moduleConfig.routeName, navigation.state), { filter: newFilter, parentId: id, title });
    } else {
      navigation.navigate(computeRelativePath(`${moduleConfig.routeName}/preview`, navigation.state), { file, title });
    }
  };

  const uploadFile = async (file: Asset | DocumentPicked) => {
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
    modalBoxRef?.current?.doDismissModal();
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
    popupMenuActions: PopupMenuAction[];
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
      return { navBarActions: { icon: 'more_vert' }, popupMenuActions };
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
  };

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
        modalBoxRef={modalBoxRef}
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

  return (
    <PageView navigation={props.navigation} navBar={navBarInfo} onBack={onGoBack}>
      {renderPage()}
    </PageView>
  );
};

export default connect(
  (gs: IGlobalState, props: any) => {
    const state = moduleConfig.getState(gs);
    const parentId = props.navigation.getParam('parentId');
    return {
      files: state.directories.data[parentId] ?? [],
      folderTree: state.folderTree.data,
      initialLoadingState:
        state.directories[parentId] === undefined ? AsyncPagedLoadingState.PRISTINE : AsyncPagedLoadingState.DONE,
      session: getUserSession(),
    };
  },
  (dispatch: ThunkDispatch<any, any, any>) =>
    bindActionCreators(
      {
        createFolder: tryAction(createWorkspaceFolderAction, undefined, true),
        deleteFiles: tryAction(deleteWorkspaceFilesAction, undefined, true),
        downloadFiles: tryAction(downloadWorkspaceFilesAction, undefined, true),
        duplicateFiles: tryAction(copyWorkspaceFilesAction, undefined, true),
        fetchFiles: tryAction(fetchWorkspaceFilesAction, undefined, true),
        listFolders: tryAction(listWorkspaceFoldersAction, undefined, true),
        moveFiles: tryAction(moveWorkspaceFilesAction, undefined, true),
        previewFile: tryAction(downloadThenOpenWorkspaceFileAction, undefined, true),
        renameFile: tryAction(renameWorkspaceFileAction, undefined, true),
        restoreFiles: tryAction(restoreWorkspaceFilesAction, undefined, true),
        trashFiles: tryAction(trashWorkspaceFilesAction, undefined, true),
        uploadFile: tryAction(uploadWorkspaceFileAction, undefined, true),
      },
      dispatch,
    ),
)(WorkspaceFileListScreen);
