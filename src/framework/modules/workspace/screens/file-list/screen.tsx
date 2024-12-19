import * as React from 'react';
import { Alert, Platform, RefreshControl, View } from 'react-native';

import { HeaderBackButton } from '@react-navigation/elements';
import { CommonActions, UNSTABLE_usePreventRemove } from '@react-navigation/native';
import type { NativeStackNavigationOptions, NativeStackScreenProps } from '@react-navigation/native-stack';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { ThunkDispatch } from 'redux-thunk';

import styles from './styles';
import { IWorkspaceFileListScreenProps } from './types';

import { I18n } from '~/app/i18n';
import { IGlobalState } from '~/app/store';
import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import { EmptyContentScreen, EmptyScreen } from '~/framework/components/empty-screens';
import { LoadingIndicator } from '~/framework/components/loading';
import { cameraAction, deleteAction, documentAction, galleryAction, MenuAction } from '~/framework/components/menus/actions';
import PopupMenu from '~/framework/components/menus/popup';
import { ModalBoxHandle } from '~/framework/components/ModalBox';
import NavBarAction from '~/framework/components/navigation/navbar-action';
import { PageView } from '~/framework/components/page';
import ScrollView from '~/framework/components/scrollView';
import SwipeableList from '~/framework/components/swipeableList';
import { BodyBoldText } from '~/framework/components/text';
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
import { navBarOptions, navBarTitle } from '~/framework/navigation/navBar';
import { LocalFile } from '~/framework/util/fileHandler';
import { openDocument } from '~/framework/util/fileHandler/actions';
import { tryActionLegacy } from '~/framework/util/redux/actions';
import { AsyncPagedLoadingState } from '~/framework/util/redux/asyncPaged';

const emptyTextsFolder = {
  [Filter.OWNER]: {
    text: 'workspace-filelist-emptyscreen-owner-text',
    title: 'workspace-filelist-emptyscreen-owner-title',
  },
  [Filter.PROTECTED]: {
    text: 'workspace-filelist-emptyscreen-protected-text',
    title: 'workspace-filelist-emptyscreen-protected-title',
  },
  [Filter.ROOT]: {
    text: 'workspace-filelist-emptyscreen-root-text',
    title: 'workspace-filelist-emptyscreen-root-title',
  },
  [Filter.SHARED]: {
    text: 'workspace-filelist-emptyscreen-shared-text',
    title: 'workspace-filelist-emptyscreen-shared-title',
  },
  [Filter.TRASH]: {
    text: 'workspace-filelist-emptyscreen-trash-text',
    title: 'workspace-filelist-emptyscreen-trash-title',
  },
  subfolder: {
    text: 'workspace-filelist-emptyscreen-subfolder-text',
    title: 'workspace-filelist-emptyscreen-subfolder-title',
  },
};

export const computeNavBar = ({
  navigation,
  route,
}: NativeStackScreenProps<WorkspaceNavigationParams, typeof workspaceRouteNames.home>): NativeStackNavigationOptions => ({
  ...navBarOptions({
    navigation,
    route,
    title: I18n.get('workspace-filelist-title'),
  }),
});

const WorkspaceFileListScreen = (props: IWorkspaceFileListScreenProps) => {
  const { filter, parentId } = props.route.params;
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
      const { fetchFiles, folderTree, listFolders } = props;
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

  React.useEffect(() => {
    const unsubscribe = props.navigation.addListener('focus', () => {
      if (loadingRef.current === AsyncPagedLoadingState.PRISTINE) init();
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
    //const { /*files, */ navigation } = props;
    // const data = files
    //   .filter(f => f.contentType?.startsWith('image'))
    //   .map(f => ({
    //     type: 'image',
    //     src: { uri: f.url },
    //     link: f.url,
    //   })) as IMedia[];
    // const startIndex = data.findIndex(f => f.link === file.url);
    // openCarousel({ data, startIndex }, navigation)
    openDocument(convertIFileToIDistantFile(file));
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
    const { id, isFolder, name: title } = file;
    if (isFolder) {
      const newFilter = filter === Filter.ROOT ? id : filter;
      navigation.push(moduleConfig.routeName, { filter: newFilter, parentId: id, title });
    } else {
      navigation.navigate(workspaceRouteNames.filePreview, { file, title });
    }
  };

  const uploadFile = async file => {
    setUploading(true);
    await props.uploadFile(parentId, new LocalFile(file, { _needIOSReleaseSecureAccess: false }));
    setUploading(false);
    fetchList();
  };

  const trashFiles = async (ids: string[]) => {
    await props.trashFiles(parentId, ids);
    setSelectedFiles([]);
    fetchList(parentId, true);
  };

  const deleteFiles = async (ids: string[]) => {
    await props.deleteFiles(parentId, ids);
    setSelectedFiles([]);
    fetchList(parentId, true);
  };

  const alertPermanentDeletion = (ids: string[]) => {
    Alert.alert(I18n.get('workspace-filelist-deletealert-title'), I18n.get('workspace-filelist-deletealert-message'), [
      {
        style: 'default',
        text: I18n.get('common-cancel'),
      },
      {
        onPress: () => deleteFiles(ids),
        style: 'destructive',
        text: I18n.get('common-delete'),
      },
    ]);
  };

  const restoreSelectedFiles = async () => {
    const ids = selectedFiles;
    setSelectedFiles([]);
    await props.restoreFiles(parentId, ids);
    refresh();
  };

  const onModalAction = async (files: IFile[], value: string, destinationId: string) => {
    const ids = files.map(f => f.id);
    setSelectedFiles([]);
    modalBoxRef.current?.doDismissModal();
    switch (modalType) {
      case WorkspaceModalType.COPY:
        await props.duplicateFiles(parentId, ids, destinationId);
        return fetchList(destinationId, true);
      case WorkspaceModalType.CREATE_FOLDER:
        await props.createFolder(value, parentId);
        return fetchList(parentId, true);
      case WorkspaceModalType.DOWNLOAD:
        return props.downloadFiles(files);
      case WorkspaceModalType.MOVE:
        await props.moveFiles(parentId, ids, destinationId);
        fetchList(destinationId);
        return fetchList(parentId, true);
      case WorkspaceModalType.RENAME:
        await props.renameFile(files[0], value);
        return fetchList(parentId, true);
    }
  };

  React.useEffect(() => {
    const getNavBarActions = (): { actionIcon: string; menuActions: MenuAction[] } => {
      if (isSelectionActive) {
        const isFolderSelected = props.files.filter(file => selectedFiles.includes(file.id)).some(file => file.isFolder);
        const menuActions = [
          ...(selectedFiles.length === 1 && filter === Filter.OWNER
            ? [
                {
                  action: () => openModal(WorkspaceModalType.RENAME),
                  icon: {
                    android: 'ic_pencil',
                    ios: 'pencil',
                  },
                  title: I18n.get('workspace-filelist-menuaction-rename'),
                },
              ]
            : []),
          ...(filter !== Filter.TRASH
            ? [
                {
                  action: () => openModal(WorkspaceModalType.COPY),
                  icon: {
                    android: 'ic_content_copy',
                    ios: 'square.on.square',
                  },
                  title: I18n.get('workspace-filelist-menuaction-copy'),
                },
              ]
            : []),
          ...(filter === Filter.OWNER
            ? [
                {
                  action: () => openModal(WorkspaceModalType.MOVE),
                  icon: {
                    android: 'ic_move_to_inbox',
                    ios: 'arrow.up.square',
                  },
                  title: I18n.get('workspace-filelist-menuaction-move'),
                },
              ]
            : []),
          ...(filter === Filter.TRASH
            ? [
                {
                  action: restoreSelectedFiles,
                  icon: {
                    android: 'ic_restore',
                    ios: 'arrow.uturn.backward.circle',
                  },
                  title: I18n.get('workspace-filelist-menuaction-restore'),
                },
              ]
            : []),
          ...(Platform.OS !== 'ios' && !isFolderSelected
            ? [
                {
                  action: () => openModal(WorkspaceModalType.DOWNLOAD),
                  icon: {
                    android: 'ic_download',
                    ios: 'square.and.arrow.down',
                  },
                  title: I18n.get('workspace-filelist-menuaction-download'),
                },
              ]
            : []),
          ...((selectedFiles.length >= 1 && filter === Filter.OWNER) || filter === Filter.TRASH
            ? [
                deleteAction({
                  action: () => (filter === Filter.TRASH ? alertPermanentDeletion(selectedFiles) : trashFiles(selectedFiles)),
                }),
              ]
            : []),
        ];
        return { actionIcon: 'ui-options', menuActions };
      }
      if (filter === Filter.OWNER || (filter === Filter.SHARED && parentId !== Filter.SHARED)) {
        const menuActions = [
          cameraAction({ callback: uploadFile }),
          galleryAction({ callback: uploadFile, multiple: true }),
          documentAction({ callback: uploadFile }),
          ...(filter === Filter.OWNER
            ? [
                {
                  action: () => openModal(WorkspaceModalType.CREATE_FOLDER),
                  icon: {
                    android: 'ic_create_new_folder',
                    ios: 'folder.badge.plus',
                  },
                  title: I18n.get('workspace-filelist-menuaction-createfolder'),
                },
              ]
            : []),
        ];
        return { actionIcon: 'ui-plus', menuActions };
      }
      return { actionIcon: '', menuActions: [] };
    };
    const { actionIcon, menuActions } = getNavBarActions();
    props.navigation.setOptions({
      headerLeft: ({ tintColor }) => (
        <>
          <HeaderBackButton
            labelVisible={false}
            style={{ marginLeft: -UI_SIZES.spacing.minor }}
            tintColor={tintColor}
            onPress={() => props.navigation.dispatch(CommonActions.goBack())}
          />
          {isSelectionActive ? <BodyBoldText style={styles.navBarCountText}>{selectedFiles.length}</BodyBoldText> : null}
        </>
      ),

      headerRight: () => (
        <PopupMenu actions={menuActions}>
          <NavBarAction icon={actionIcon} />
        </PopupMenu>
      ),
    });
  }, [
    alertPermanentDeletion,
    filter,
    isSelectionActive,
    parentId,
    props.files,
    props.navigation,
    props.route.params.title,
    restoreSelectedFiles,
    selectedFiles,
    trashFiles,
    uploadFile,
  ]);

  const renderEmpty = () => {
    const image = parentId === Filter.TRASH ? 'empty-trash' : 'empty-workspace';
    const screen = Object.values(Filter).includes(parentId as Filter) ? parentId : 'subfolder';
    return (
      <EmptyScreen
        svgImage={image}
        title={I18n.get(emptyTextsFolder[screen].title)}
        text={I18n.get(emptyTextsFolder[screen].text)}
      />
    );
  };

  const renderError = () => {
    return (
      <ScrollView refreshControl={<RefreshControl refreshing={loadingState === AsyncPagedLoadingState.RETRY} onRefresh={reload} />}>
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
                      actionIcon: 'ui-unarchive',
                      actionText: I18n.get('workspace-filelist-swipeaction-restore'),
                      backgroundColor: theme.palette.status.success.regular,
                    },
                  ]
                : [],
            right:
              filter === Filter.OWNER || filter === Filter.TRASH
                ? [
                    {
                      action: async row => {
                        if (filter === Filter.TRASH) {
                          alertPermanentDeletion([item.key]);
                        } else {
                          trashFiles([item.key]);
                        }
                        row[item.key]?.closeRow();
                      },
                      actionIcon: 'ui-trash',
                      actionText: I18n.get('workspace-filelist-swipeaction-delete'),
                      backgroundColor: theme.palette.status.failure.regular,
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

  UNSTABLE_usePreventRemove(isSelectionActive, () => setSelectedFiles([]));

  props.navigation.setOptions({
    headerTitle: navBarTitle(props.route.params.title ?? I18n.get('workspace-filelist-title')),
  });

  return <PageView>{renderPage()}</PageView>;
};

export default connect(
  (state: IGlobalState, props: any) => {
    const workspaceState = moduleConfig.getState(state);
    const { parentId } = props.route.params;
    return {
      files: workspaceState.directories.data[parentId] ?? [],
      folderTree: workspaceState.folderTree.data,
      initialLoadingState:
        workspaceState.directories[parentId] === undefined ? AsyncPagedLoadingState.PRISTINE : AsyncPagedLoadingState.DONE,
      session: getSession(),
    };
  },
  (dispatch: ThunkDispatch<any, any, any>) =>
    bindActionCreators(
      {
        createFolder: tryActionLegacy(
          createWorkspaceFolderAction,
          undefined,
          true,
        ) as unknown as IWorkspaceFileListScreenProps['createFolder'],
        deleteFiles: tryActionLegacy(
          deleteWorkspaceFilesAction,
          undefined,
          true,
        ) as unknown as IWorkspaceFileListScreenProps['deleteFiles'],
        downloadFiles: tryActionLegacy(
          downloadWorkspaceFilesAction,
          undefined,
          true,
        ) as unknown as IWorkspaceFileListScreenProps['downloadFiles'],
        duplicateFiles: tryActionLegacy(
          copyWorkspaceFilesAction,
          undefined,
          true,
        ) as unknown as IWorkspaceFileListScreenProps['duplicateFiles'],
        fetchFiles: tryActionLegacy(
          fetchWorkspaceFilesAction,
          undefined,
          true,
        ) as unknown as IWorkspaceFileListScreenProps['fetchFiles'],
        listFolders: tryActionLegacy(
          listWorkspaceFoldersAction,
          undefined,
          true,
        ) as unknown as IWorkspaceFileListScreenProps['listFolders'],
        moveFiles: tryActionLegacy(
          moveWorkspaceFilesAction,
          undefined,
          true,
        ) as unknown as IWorkspaceFileListScreenProps['moveFiles'],
        previewFile: tryActionLegacy(
          downloadThenOpenWorkspaceFileAction,
          undefined,
          true,
        ) as unknown as IWorkspaceFileListScreenProps['previewFile'],
        renameFile: tryActionLegacy(
          renameWorkspaceFileAction,
          undefined,
          true,
        ) as unknown as IWorkspaceFileListScreenProps['renameFile'],
        restoreFiles: tryActionLegacy(
          restoreWorkspaceFilesAction,
          undefined,
          true,
        ) as unknown as IWorkspaceFileListScreenProps['restoreFiles'],
        trashFiles: tryActionLegacy(
          trashWorkspaceFilesAction,
          undefined,
          true,
        ) as unknown as IWorkspaceFileListScreenProps['trashFiles'],
        uploadFile: tryActionLegacy(
          uploadWorkspaceFileAction,
          undefined,
          true,
        ) as unknown as IWorkspaceFileListScreenProps['uploadFile'],
      },
      dispatch,
    ),
)(WorkspaceFileListScreen);
