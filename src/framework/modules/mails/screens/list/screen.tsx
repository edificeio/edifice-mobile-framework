import * as React from 'react';
import { Alert, BackHandler, Dimensions, ScrollViewProps, TextInput, TouchableOpacity, View } from 'react-native';

import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackNavigationOptions, NativeStackScreenProps } from '@react-navigation/native-stack';
import { FlatList as GHFlatList } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { connect } from 'react-redux';

import styles from './styles';
import type { MailsListScreenPrivateProps } from './types';

import { I18n } from '~/app/i18n';
import theme from '~/app/theme';
import TertiaryButton from '~/framework/components/buttons/tertiary';
import { Checkbox } from '~/framework/components/checkbox';
import { UI_SIZES } from '~/framework/components/constants';
import { EmptyScreen } from '~/framework/components/empty-screens';
import SearchInput from '~/framework/components/inputs/search';
import FlatList from '~/framework/components/list/flat-list';
import { deleteAction } from '~/framework/components/menus/actions';
import PopupMenu from '~/framework/components/menus/popup';
import BottomSheetModal, { BottomSheetModalMethods } from '~/framework/components/modals/bottom-sheet';
import { NavBarAction, NavBarActionsGroup } from '~/framework/components/navigation';
import { PageView } from '~/framework/components/page';
import Separator from '~/framework/components/separator';
import StatusBar from '~/framework/components/status-bar';
import { BodyBoldText, BodyText } from '~/framework/components/text';
import toast from '~/framework/components/toast';
import { Toggle } from '~/framework/components/toggle';
import { ContentLoader } from '~/framework/hooks/loader';
import { getSession } from '~/framework/modules/auth/reducer';
import MailsFolderItem from '~/framework/modules/mails/components/folder-item';
import stylesFolders from '~/framework/modules/mails/components/folder-item/styles';
import MailsInputBottomSheet from '~/framework/modules/mails/components/input-bottom-sheet';
import MailsMailPreview from '~/framework/modules/mails/components/mail-preview';
import MailsMoveBottomSheet from '~/framework/modules/mails/components/move-bottom-sheet';
import { MailsPlaceholderList, MailsPlaceholderLittleList } from '~/framework/modules/mails/components/placeholder/list';
import {
  IMailsFolder,
  IMailsMailPreview,
  MailsDefaultFolders,
  MailsFolderInfo,
  MailsListTypeModal,
  MailsMailStatePreview,
} from '~/framework/modules/mails/model';
import { MailsNavigationParams, mailsRouteNames } from '~/framework/modules/mails/navigation';
import { mailsService } from '~/framework/modules/mails/service';
import { readLastCallTimestamp, reloadVisibles } from '~/framework/modules/mails/storage';
import { flattenFolders, mailsDefaultFoldersInfos } from '~/framework/modules/mails/util';
import { navBarOptions, navBarTitle } from '~/framework/navigation/navBar';
import { HTTPError } from '~/framework/util/http';

export const computeNavBar = ({
  navigation,
  route,
}: NativeStackScreenProps<MailsNavigationParams, typeof mailsRouteNames.home>): NativeStackNavigationOptions => ({
  ...navBarOptions({
    navigation,
    route,
    title: '',
  }),
});

const PAGE_SIZE = 25;
const TIMEOUT_DURATION = 300;

const MailsListScreen = (props: MailsListScreenPrivateProps) => {
  const bottomSheetModalRef = React.useRef<BottomSheetModalMethods>(null);
  const flatListRef = React.useRef<GHFlatList<IMailsMailPreview>>(null);
  const searchInputRef = React.useRef<TextInput>(null);
  //TODO: créer un wrapper
  const { top: statusBarHeight } = useSafeAreaInsets();
  const navigation = props.navigation;

  const [selectedFolder, setSelectedFolder] = React.useState<MailsDefaultFolders | MailsFolderInfo>(MailsDefaultFolders.INBOX);
  const [typeModal, setTypeModal] = React.useState<MailsListTypeModal | undefined>(undefined);
  const [pageNb, setPageNb] = React.useState<number>(0);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [isLoadingNextPage, setIsLoadingNextPage] = React.useState<boolean>(false);
  const [hasNextMails, setHasNextMails] = React.useState<boolean>(true);
  const [mails, setMails] = React.useState<IMailsMailPreview[]>([]);
  const [folders, setFolders] = React.useState<IMailsFolder[]>([]);
  const [folderCounts, setFolderCounts] = React.useState<Record<MailsDefaultFolders, number>>();
  const [isSubfolder, setIsSubfolder] = React.useState<boolean>(false);
  const [idParentFolder, setIdParentFolder] = React.useState<string | undefined>(undefined);
  const [isLoadingCreateNewFolder, setIsLoadingCreateNewFolder] = React.useState<boolean>(false);
  const [onErrorCreateFolder, setOnErrorCreateFolder] = React.useState<boolean>(false);
  const [isSelectionMode, setIsSelectionMode] = React.useState<boolean>(false);
  const [isSearchMode, setIsSearchMode] = React.useState<boolean>(false);
  const [selectedMails, setSelectedMails] = React.useState<string[]>([]);
  const [search, setSearch] = React.useState<string>('');

  const loadMails = React.useCallback(
    async (folder: MailsDefaultFolders | MailsFolderInfo, searchValue?: string) => {
      try {
        setIsLoading(true);
        setPageNb(0);
        if (!hasNextMails) setHasNextMails(true);
        const folderId = typeof folder === 'object' ? folder.id : (folder as string);
        const mailsData = await mailsService.mails.get({
          folderId,
          pageNb: 0,
          pageSize: PAGE_SIZE,
          search: searchValue ?? '',
        });
        setMails(mailsData);
        setIsLoading(false);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    },
    [hasNextMails],
  );

  const loadNextMails = React.useCallback(async () => {
    try {
      if (mails.length < PAGE_SIZE * (pageNb + 1) || !hasNextMails) return;
      setIsLoadingNextPage(true);
      const folderId = typeof selectedFolder === 'object' ? selectedFolder.id : selectedFolder;
      const mailsData = await mailsService.mails.get({ folderId, pageNb: pageNb + 1, pageSize: PAGE_SIZE, search });
      if (mailsData.length === 0) return setHasNextMails(false);
      setMails([...mails, ...mailsData]);
      setPageNb(pageNb + 1);
    } catch (e) {
      console.error(e);
      toast.showError();
    } finally {
      setIsLoadingNextPage(false);
    }
  }, [mails, pageNb, hasNextMails, selectedFolder, search]);

  const loadFolders = React.useCallback(async () => {
    try {
      const foldersData = await mailsService.folders.get({ depth: 2 });
      const flattenedFolders = flattenFolders(foldersData);
      setFolders(flattenedFolders);

      const counts: Record<string, number> = {};
      for (const folder of Object.values(MailsDefaultFolders)) {
        try {
          if (folder === MailsDefaultFolders.OUTBOX || folder === MailsDefaultFolders.TRASH) {
            counts[folder] = 0;
          } else {
            const countData = await mailsService.folder.count({
              folderId: folder,
              unread: folder === MailsDefaultFolders.DRAFTS ? false : true,
            });
            counts[folder] = countData.count;
          }
        } catch (e) {
          console.error(`Failed to fetch count for folder: ${folder}`, e);
        }
      }
      setFolderCounts(counts);
    } catch (e) {
      console.error(e);
    }
  }, [setFolders, setFolderCounts]);

  const loadData = React.useCallback(async () => {
    try {
      await Promise.all([loadMails(selectedFolder, search), loadFolders()]);
    } catch (e) {
      console.error(e);
    }
  }, [loadMails, selectedFolder, search, loadFolders]);

  const onDismissBottomSheet = React.useCallback(() => {
    bottomSheetModalRef.current?.dismiss();
    if (typeModal) setTypeModal(undefined);
    if (isSubfolder) setIsSubfolder(false);
    if (idParentFolder) setIdParentFolder(undefined);
    if (onErrorCreateFolder) setOnErrorCreateFolder(false);
  }, [typeModal, isSubfolder, idParentFolder, onErrorCreateFolder]);

  const switchFolder = React.useCallback(
    async (folder: MailsDefaultFolders | MailsFolderInfo) => {
      try {
        setSelectedFolder(folder);
        onDismissBottomSheet();
        await loadMails(folder);
        flatListRef.current?.scrollToOffset({ animated: true, offset: 0 });
      } catch (e) {
        console.error(e);
      }
    },
    [loadMails, onDismissBottomSheet],
  );

  const onPressItem = React.useCallback(
    (id: string, unread: boolean, state: MailsMailStatePreview) => {
      if (state === MailsMailStatePreview.DRAFT && selectedFolder !== MailsDefaultFolders.TRASH)
        return navigation.navigate(mailsRouteNames.edit, { draftId: id, fromFolder: selectedFolder });
      if (unread) setMails(prevMails => prevMails.map(mail => (mail.id === id ? { ...mail, unread: false } : mail)));
      return navigation.navigate(mailsRouteNames.details, { folders, fromFolder: selectedFolder, id });
    },
    [selectedFolder, navigation, setMails, folders],
  );

  const onToggleSubfolders = React.useCallback(() => {
    setIsSubfolder(!isSubfolder);
    setIdParentFolder(undefined);
  }, [isSubfolder, setIsSubfolder, setIdParentFolder]);

  const handleFolderOperation = React.useCallback(
    async (operation: 'create' | 'rename', valueFolderName: string, successMessage: string) => {
      try {
        if (onErrorCreateFolder) setOnErrorCreateFolder(false);
        setIsLoadingCreateNewFolder(true);

        if (operation === 'create') {
          const dataNewFolder = await mailsService.folder.create({
            name: valueFolderName,
            parentId: idParentFolder ?? '',
          });
          if (!isSelectionMode) switchFolder({ id: dataNewFolder, name: valueFolderName });
          else {
            onActionMultiple(() => onMove(selectedMails, dataNewFolder));
          }
        } else if (operation === 'rename') {
          await mailsService.folder.rename({ id: (selectedFolder as MailsFolderInfo).id }, { name: valueFolderName });
          setSelectedFolder({
            id: (selectedFolder as MailsFolderInfo).id,
            name: valueFolderName,
          });
        }

        loadFolders();
        onDismissBottomSheet();
        toast.showSuccess(successMessage);
      } catch (e) {
        const error = e instanceof HTTPError ? await e.json() : e;
        if (error instanceof Error) {
          toast.showError();
          return;
        }
        if (error?.error === 'conversation.error.duplicate.folder') {
          setOnErrorCreateFolder(true);
        }
      } finally {
        setIsLoadingCreateNewFolder(false);
      }
    },
    [
      onErrorCreateFolder,
      loadFolders,
      onDismissBottomSheet,
      idParentFolder,
      isSelectionMode,
      switchFolder,
      onActionMultiple,
      onMove,
      selectedMails,
      selectedFolder,
    ],
  );

  const onCreateFolderAction = React.useCallback(
    (valueFolderName: string) => {
      return handleFolderOperation('create', valueFolderName, I18n.get('mails-list-newfoldersuccess', { name: valueFolderName }));
    },
    [handleFolderOperation],
  );

  const onRenameFolderAction = React.useCallback(
    (valueFolderName: string) => {
      return handleFolderOperation('rename', valueFolderName, I18n.get('mails-list-renamefoldersuccess'));
    },
    [handleFolderOperation],
  );

  const onRenameFolder = React.useCallback(() => {
    setTypeModal(MailsListTypeModal.RENAME);
    bottomSheetModalRef.current?.present();
  }, []);

  const onActiveSearchMode = React.useCallback(() => {
    setIsSearchMode(true);
    setTimeout(() => {
      searchInputRef.current?.focus();
    }, 500);
  }, []);

  const onDisabledSearchMode = React.useCallback(() => {
    setIsSearchMode(false);
    setSearch('');
    setTimeout(() => {
      loadMails(selectedFolder, '');
    }, TIMEOUT_DURATION);
  }, [loadMails, selectedFolder]);

  const onActiveSelectMode = React.useCallback((mailId: string) => {
    if (mailId) setSelectedMails([mailId]);
    setIsSelectionMode(true);
  }, []);

  const onDisableSelectMode = React.useCallback(() => {
    setIsSelectionMode(false);
    if (selectedMails.length) setSelectedMails([]);
  }, [selectedMails]);

  const onConfigureSignature = React.useCallback(async () => {
    navigation.navigate(mailsRouteNames.signature, {});
  }, [navigation]);

  const onDeleteFolder = React.useCallback(() => {
    Alert.alert(I18n.get('mails-list-deletefolder'), I18n.get('mails-list-deletefoldertext'), [
      {
        style: 'default',
        text: I18n.get('common-cancel'),
      },
      {
        onPress: async () => {
          try {
            await mailsService.folder.delete({ id: (selectedFolder as MailsFolderInfo).id });
            switchFolder(MailsDefaultFolders.INBOX);
            loadFolders();
            toast.showSuccess(I18n.get('mails-list-toastsuccessdeletefolder'));
          } catch (e) {
            console.error(e);
            toast.showError();
          }
        },
        style: 'destructive',
        text: I18n.get('common-delete'),
      },
    ]);
  }, [loadFolders, selectedFolder, switchFolder]);

  const handleMailAction = React.useCallback(
    async ({
      action,
      successMessage,
      updateMails,
    }: {
      action: () => Promise<void>;
      updateMails?: () => void;
      successMessage: string;
    }) => {
      try {
        await action();
        if (updateMails) updateMails();
        loadFolders();
        toast.showSuccess(I18n.get(successMessage));
      } catch (e) {
        console.error(e);
        toast.showError();
      }
    },
    [loadFolders],
  );

  const onDelete = React.useCallback(
    async (ids: string[], permanently?: boolean) => {
      await handleMailAction({
        action: () => (permanently ? mailsService.mail.delete({ ids }) : mailsService.mail.moveToTrash({ ids })),
        successMessage: permanently ? 'mails-toastsuccessdelete' : 'mails-toastsuccesstrash',
        updateMails: () => setMails(prevMails => prevMails.filter(mail => !ids.includes(mail.id))),
      });
    },
    [handleMailAction],
  );

  const onToggleUnread = React.useCallback(
    async (ids: string[], unread: boolean) => {
      await handleMailAction({
        action: () => mailsService.mail.toggleUnread({ ids, unread: !unread }),
        successMessage: unread ? 'mails-toastsuccessread' : 'mails-toastsuccessunread',
        updateMails: () =>
          setMails(prevMails => prevMails.map(mail => (ids.includes(mail.id) ? { ...mail, unread: !unread } : mail))),
      });
    },
    [handleMailAction],
  );

  const onRestore = React.useCallback(
    async (ids: string[]) => {
      await handleMailAction({
        action: () => mailsService.mail.restore({ ids }),
        successMessage: 'mails-toastsuccessrestore',
        updateMails: () => setMails(prevMails => prevMails.filter(mail => !ids.includes(mail.id))),
      });
    },
    [handleMailAction],
  );

  const onMove = React.useCallback(
    async (ids: string[], folderId: string) => {
      bottomSheetModalRef.current?.dismiss();
      await handleMailAction({
        action: () => mailsService.mail.moveToFolder({ folderId }, { ids }),
        successMessage: 'mails-toastsuccessmove',
        updateMails: () => setMails(prevMails => prevMails.filter(mail => !ids.includes(mail.id))),
      });
    },
    [handleMailAction],
  );

  const onRemoveFromFolder = React.useCallback(
    async (ids: string[]) => {
      await handleMailAction({
        action: () => mailsService.mail.removeFromFolder({ ids }),
        successMessage: 'mails-toastsuccessremovefromfolder',
        updateMails: () => setMails(prevMails => prevMails.filter(mail => !ids.includes(mail.id))),
      });
    },
    [handleMailAction],
  );

  const onSelectMail = React.useCallback(
    (id: string) => {
      if (selectedMails.includes(id)) setSelectedMails(prev => prev.filter(mailId => mailId !== id));
      else setSelectedMails(prev => [...prev, id]);
    },
    [selectedMails],
  );

  const onSelectAll = React.useCallback(() => {
    if (selectedMails.length === mails.length) setSelectedMails([]);
    else setSelectedMails(mails.map(mail => mail.id));
  }, [mails, selectedMails]);

  const onActionMultiple = React.useCallback(
    async (action: () => Promise<void>) => {
      try {
        action();
        setSelectedMails([]);
        setIsSelectionMode(false);
      } catch (e) {
        console.error(e);
      }
    },
    [setSelectedMails, setIsSelectionMode],
  );

  const allPopupActionsMenu = React.useMemo(
    () => [
      {
        action: onActiveSelectMode,
        icon: {
          android: 'ic_check',
          ios: 'checkmark',
        },
        title: I18n.get('mails-list-select'),
      },
      {
        action: onActiveSearchMode,
        icon: {
          android: 'ic_signature',
          ios: 'magnifyingglass',
        },
        title: I18n.get('common-search'),
      },
      {
        action: onConfigureSignature,
        icon: {
          android: 'ic_signature',
          ios: 'scribble',
        },
        title: I18n.get('mails-list-configuresignature'),
      },
      {
        action: onRenameFolder,
        icon: {
          android: 'ic_pencil',
          ios: 'pencil',
        },
        title: I18n.get('mails-list-renamefolder'),
      },
      deleteAction({
        action: onDeleteFolder,
        title: I18n.get('mails-list-deletefolder'),
      }),
    ],
    [onActiveSelectMode, onActiveSearchMode, onConfigureSignature, onRenameFolder, onDeleteFolder],
  );

  const handleHardwareBack = React.useCallback(() => {
    if (isSelectionMode) onDisableSelectMode();
    if (isSearchMode) onDisabledSearchMode();
    setTimeout(() => {
      navigation.goBack();
    }, 200);
    return true;
  }, [isSearchMode, isSelectionMode, navigation, onDisableSelectMode, onDisabledSearchMode]);

  React.useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', handleHardwareBack);
    return () => {
      backHandler.remove();
    };
  }, [handleHardwareBack]);

  React.useEffect(() => {
    const unsubscribe = props.navigation.getParent('tabs').addListener('tabPress', () => {
      setSelectedFolder(MailsDefaultFolders.INBOX);
      loadMails(MailsDefaultFolders.INBOX);
    });
    return unsubscribe;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  React.useEffect(() => {
    const lastCall = readLastCallTimestamp();
    const now = Date.now();
    //reload visibles if last call was more than 1 hour ago or never called
    if (now - lastCall > 3600_000 || lastCall === 0) reloadVisibles();
  }, []);

  React.useEffect(() => {
    props.navigation.setOptions({
      headerLeft: () => (
        <NavBarAction
          icon="ui-burgerMenu"
          onPress={() => {
            bottomSheetModalRef.current?.present();
          }}
        />
      ),
      headerRight: () => (
        <NavBarActionsGroup
          elements={[
            <NavBarAction
              icon="ui-edit"
              onPress={() => navigation.navigate(mailsRouteNames.edit, { fromFolder: selectedFolder })}
            />,
            <PopupMenu actions={selectedFolder && selectedFolder.id ? allPopupActionsMenu : allPopupActionsMenu.slice(0, 3)}>
              <NavBarAction icon="ui-options" />
            </PopupMenu>,
          ]}
        />
      ),
    });
  }, [selectedFolder, navigation, props.navigation, allPopupActionsMenu]);

  React.useEffect(() => {
    props.navigation.setOptions({
      headerTitle: navBarTitle(
        I18n.get(
          typeof selectedFolder !== 'object'
            ? mailsDefaultFoldersInfos[selectedFolder as MailsDefaultFolders].title
            : selectedFolder.name,
        ),
        undefined,
        undefined,
        1,
        2,
      ),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedFolder, navigation]);

  React.useEffect(() => {
    props.navigation.setOptions({
      headerShown: !isSelectionMode && !isSearchMode,
    });
    props.navigation.setParams({ tabBarVisible: !isSelectionMode });
  }, [isSearchMode, isSelectionMode, props.navigation]);

  useFocusEffect(
    React.useCallback(() => {
      const { params } = props.route;
      if (params.from && (params.reload || params.idMailToRemove || params.idMailToMarkUnread || params.idMailToRecall)) {
        if (params.reload) loadMails(params.from);
        if (params.idMailToRemove) setMails(prevMails => prevMails.filter(mail => mail.id !== params.idMailToRemove));
        if (params.idMailToRecall)
          setMails(prevMails =>
            prevMails.map(mail => (mail.id === params.idMailToRecall ? { ...mail, state: MailsMailStatePreview.RECALL } : mail)),
          );
        if (params.idMailToMarkUnread)
          setMails(prevMails => prevMails.map(mail => (mail.id === params.idMailToMarkUnread ? { ...mail, unread: true } : mail)));
        setSelectedFolder(params.from);
        loadFolders();
      } else {
        loadFolders();
      }
      if (params.from) props.navigation.setParams({ from: undefined });
    }, [loadFolders, loadMails, props.navigation, props.route]),
  );

  const renderSearch = React.useCallback(() => {
    return (
      <SearchInput
        value={search}
        onChangeText={setSearch}
        onSubmitEditing={() => loadMails(selectedFolder, search)}
        ref={searchInputRef}
        onClear={() => loadMails(selectedFolder, '')}
      />
    );
  }, [loadMails, search, selectedFolder]);

  const renderAllSelect = React.useCallback(() => {
    return (
      <TouchableOpacity onPress={onSelectAll} style={styles.selectModeTopText}>
        <Checkbox
          onPress={onSelectAll}
          checked={mails.length === selectedMails.length}
          partialyChecked={selectedMails.length > 0 && mails.length !== selectedMails.length}
        />
        <BodyBoldText>{`(${selectedMails.length}) ${I18n.get('mails-list-selectall')}`}</BodyBoldText>
      </TouchableOpacity>
    );
  }, [mails.length, onSelectAll, selectedMails]);

  const renderTopMode = React.useCallback(() => {
    if (!isSelectionMode && !isSearchMode) return;
    return (
      <>
        <StatusBar type="white" />
        <View
          style={[
            styles.selectMode,
            styles.selectModeTop,
            { height: UI_SIZES.elements.navbarHeight + statusBarHeight, paddingTop: statusBarHeight },
            isSelectionMode ? styles.selectModeShadow : {},
          ]}>
          {isSearchMode && renderSearch()}
          {isSelectionMode && renderAllSelect()}
          <TertiaryButton
            text={I18n.get('common-cancel')}
            action={isSelectionMode ? onDisableSelectMode : onDisabledSearchMode}
            style={[styles.selectModeTopButton, isSearchMode ? styles.searchModeTopButton : {}]}
          />
        </View>
      </>
    );
  }, [isSearchMode, isSelectionMode, onDisableSelectMode, onDisabledSearchMode, renderAllSelect, renderSearch, statusBarHeight]);

  const renderBottomMode = React.useCallback(() => {
    if (!isSelectionMode) return;

    const moveButton = (
      <TertiaryButton
        iconLeft="ui-folderMove"
        disabled={selectedMails.length === 0}
        action={() => {
          setTypeModal(MailsListTypeModal.MOVE);
          bottomSheetModalRef.current?.present();
        }}
      />
    );

    const actionsByFolder: Record<string, React.ReactNode> = {
      [MailsDefaultFolders.INBOX]: (
        <>
          <TertiaryButton
            iconLeft="ui-mailUnread"
            disabled={selectedMails.length === 0 || selectedMails.every(mailId => mails.find(mail => mail.id === mailId)?.unread)}
            action={() => onActionMultiple(() => onToggleUnread(selectedMails, false))}
          />
          <TertiaryButton
            iconLeft="ui-mailRead"
            disabled={selectedMails.length === 0 || selectedMails.every(mailId => !mails.find(mail => mail.id === mailId)?.unread)}
            action={() => onActionMultiple(() => onToggleUnread(selectedMails, true))}
          />
          {moveButton}
        </>
      ),
      [MailsDefaultFolders.TRASH]: (
        <TertiaryButton
          iconLeft="ui-restore"
          disabled={selectedMails.length === 0}
          action={() => onActionMultiple(() => onRestore(selectedMails))}
        />
      ),
      [MailsDefaultFolders.OUTBOX]: moveButton,
      [MailsDefaultFolders.DRAFTS]: null,
    };

    const renderActions = selectedFolder.name ? (
      <>
        <TertiaryButton
          iconLeft="ui-mailUnread"
          disabled={
            selectedMails.length === 0 ||
            selectedMails.every(mailId => mails.find(mail => mail.id === mailId)?.unread) ||
            selectedMails.some(mailId => mails.find(mail => mail.id === mailId)?.from.id === props.session?.user.id)
          }
          action={() => onActionMultiple(() => onToggleUnread(selectedMails, false))}
        />
        <TertiaryButton
          iconLeft="ui-mailRead"
          disabled={
            selectedMails.length === 0 ||
            selectedMails.every(mailId => !mails.find(mail => mail.id === mailId)?.unread) ||
            selectedMails.some(mailId => mails.find(mail => mail.id === mailId)?.from.id === props.session?.user.id)
          }
          action={() => onActionMultiple(() => onToggleUnread(selectedMails, true))}
        />
        {moveButton}
        <TertiaryButton
          iconLeft="ui-deleteFromFolder"
          disabled={selectedMails.length === 0}
          action={() => onActionMultiple(() => onRemoveFromFolder(selectedMails))}
        />
      </>
    ) : (
      actionsByFolder[selectedFolder as MailsDefaultFolders]
    );

    return (
      <View style={[styles.selectMode, styles.selectModeShadow, styles.selectModeBottom]}>
        {renderActions}
        <TertiaryButton
          iconLeft="ui-delete"
          contentColor={theme.palette.status.failure.regular}
          disabled={selectedMails.length === 0}
          action={() =>
            onActionMultiple(() => onDelete(selectedMails, selectedFolder === MailsDefaultFolders.TRASH ? true : false))
          }
        />
      </View>
    );
  }, [
    isSelectionMode,
    mails,
    onActionMultiple,
    onDelete,
    onRemoveFromFolder,
    onRestore,
    onToggleUnread,
    selectedFolder,
    selectedMails,
  ]);

  const renderFolders = React.useCallback(() => {
    return (
      <GHFlatList
        data={folders}
        contentContainerStyle={styles.flatListBottomSheet}
        showsVerticalScrollIndicator={false}
        bounces={false}
        ItemSeparatorComponent={() => <View style={styles.spacingFolder} />}
        ListHeaderComponent={
          <>
            <View style={styles.defaultFolders}>
              {Object.keys(mailsDefaultFoldersInfos).map(folder => (
                <MailsFolderItem
                  key={folder}
                  icon={mailsDefaultFoldersInfos[folder].icon}
                  name={I18n.get(mailsDefaultFoldersInfos[folder].title)}
                  selected={selectedFolder === folder}
                  onPress={() => switchFolder(folder as MailsDefaultFolders)}
                  nbUnread={folderCounts ? folderCounts[folder] : 0}
                />
              ))}
            </View>
            <Separator marginHorizontal={UI_SIZES.spacing.small} marginVertical={UI_SIZES.spacing.medium} />
          </>
        }
        ListFooterComponent={
          <TertiaryButton
            style={styles.newFolderButton}
            iconLeft="ui-plus"
            text={I18n.get('mails-list-newfolder')}
            action={() => setTypeModal(MailsListTypeModal.CREATE)}
          />
        }
        renderItem={({ item }) => (
          <MailsFolderItem
            key={item.id}
            icon="ui-folder"
            name={item.name}
            selected={typeof selectedFolder === 'object' && selectedFolder.id === item.id}
            onPress={() => switchFolder({ id: item.id, name: item.name })}
            nbUnread={item.nbUnread}
            depth={item.depth}
          />
        )}
      />
    );
  }, [folders, selectedFolder, switchFolder, folderCounts]);

  const renderCreateNewFolder = React.useCallback(() => {
    const onlyParentFolders = folders.filter(folder => folder.depth === 1);
    return (
      <MailsInputBottomSheet
        title={I18n.get('mails-list-newfolder')}
        inputLabel={I18n.get('mails-list-newfolderlabel')}
        inputPlaceholder={I18n.get('mails-list-newfolderplaceholder')}
        onError={onErrorCreateFolder}
        onSend={onCreateFolderAction}
        disabledAction={(isSubfolder && !idParentFolder) || isLoadingCreateNewFolder}
        initialInputValue="">
        {folders.length > 0 ? (
          <>
            <Separator marginVertical={UI_SIZES.spacing.medium} marginHorizontal={UI_SIZES.spacing.small} />
            <View style={styles.selectFolderTitle}>
              <BodyText>{I18n.get('mails-list-newfoldersubtitle')}</BodyText>
              <Toggle checked={isSubfolder} onCheckChange={onToggleSubfolders} color={theme.palette.primary} />
            </View>
            {isSubfolder ? (
              <GHFlatList
                data={onlyParentFolders}
                contentContainerStyle={[stylesFolders.containerFolders]}
                renderItem={({ item }) => (
                  <MailsFolderItem
                    key={item.id}
                    icon="ui-folder"
                    name={item.name}
                    selected={idParentFolder === item.id}
                    onPress={() => (idParentFolder !== item.id ? setIdParentFolder(item.id) : {})}
                  />
                )}
              />
            ) : null}
          </>
        ) : null}
      </MailsInputBottomSheet>
    );
  }, [
    folders,
    onErrorCreateFolder,
    isLoadingCreateNewFolder,
    isSubfolder,
    idParentFolder,
    onCreateFolderAction,
    onToggleSubfolders,
  ]);

  const renderRenameFolder = React.useCallback(() => {
    return (
      <MailsInputBottomSheet
        title={I18n.get('mails-list-rename')}
        inputLabel={I18n.get('mails-list-renamefolderlabel')}
        inputPlaceholder={I18n.get('mails-list-newfolderplaceholder')}
        onError={onErrorCreateFolder}
        onSend={onRenameFolderAction}
        initialInputValue={(selectedFolder as MailsFolderInfo).name ?? ''}
      />
    );
  }, [selectedFolder, onRenameFolderAction, onErrorCreateFolder]);

  const renderMove = React.useCallback(() => {
    return (
      <MailsMoveBottomSheet
        onMove={folderId => onActionMultiple(() => onMove(selectedMails, folderId))}
        folders={folders}
        mailFolderId={selectedFolder.id ?? null}
        onPressCreateFolderButton={() => setTypeModal(MailsListTypeModal.CREATE)}
      />
    );
  }, [folders, selectedFolder, onActionMultiple, onMove, selectedMails]);

  const renderContentBottomSheet = React.useCallback(() => {
    switch (typeModal) {
      case MailsListTypeModal.CREATE:
        return renderCreateNewFolder();
      case MailsListTypeModal.RENAME:
        return renderRenameFolder();
      case MailsListTypeModal.MOVE:
        return renderMove();
      default:
        return renderFolders();
    }
  }, [typeModal, renderCreateNewFolder, renderRenameFolder, renderMove, renderFolders]);

  const renderBottomSheetFolders = React.useCallback(() => {
    return (
      <BottomSheetModal
        ref={bottomSheetModalRef}
        onDismiss={onDismissBottomSheet}
        snapPoints={['90%']}
        maxDynamicContentSize={(Dimensions.get('window').height - UI_SIZES.elements.navbarHeight) * 0.9}
        enableDynamicSizing={typeModal ? false : true}
        containerStyle={styles.bottomSheet}>
        {renderContentBottomSheet()}
      </BottomSheetModal>
    );
  }, [onDismissBottomSheet, typeModal, renderContentBottomSheet]);

  const renderEmpty = React.useCallback(() => {
    let svgImage = 'empty-conversation';
    let titleKey = 'mails-list-emptytitle';
    let textKey = 'mails-list-emptytext';

    if (isSearchMode && search.length > 0) {
      svgImage = 'empty-search';
      titleKey = 'mails-list-searchnoresultstitle';
      textKey = 'mails-list-searchnoresultstext';
    } else if (selectedFolder === MailsDefaultFolders.TRASH) {
      svgImage = 'empty-trash';
      titleKey = 'mails-list-emptytitletrash';
      textKey = 'mails-list-emptytexttrash';
    }

    return (
      <EmptyScreen
        svgImage={svgImage}
        title={I18n.get(titleKey)}
        textColor={theme.palette.grey.black}
        text={I18n.get(textKey)}
        customStyle={styles.emptyscreen}
      />
    );
  }, [isSearchMode, search.length, selectedFolder]);

  const renderFooter = React.useCallback(() => (isLoadingNextPage ? <MailsPlaceholderLittleList /> : null), [isLoadingNextPage]);

  const renderMailPreview = React.useCallback(
    (mail: IMailsMailPreview) => {
      const isSender = props.session?.user.id === mail.from?.id && selectedFolder !== MailsDefaultFolders.INBOX;
      const isDraft = mail.state === MailsMailStatePreview.DRAFT;
      const isTrashed = selectedFolder === MailsDefaultFolders.TRASH;
      return (
        <MailsMailPreview
          key={mail.id}
          data={mail}
          onPress={() => onPressItem(mail.id, mail.unread, mail.state)}
          onLongPress={() => onActiveSelectMode(mail.id)}
          isSender={isSender}
          isSelectMode={isSelectionMode}
          isInPersonalFolder={typeof selectedFolder === 'object'}
          isSelected={selectedMails.includes(mail.id)}
          isTrashed={isTrashed}
          onSelect={onSelectMail}
          onDelete={() => onDelete([mail.id], isTrashed ? true : false)}
          onToggleUnread={!isDraft && !isSender && !isTrashed ? () => onToggleUnread([mail.id], mail.unread) : undefined}
          onRestore={isTrashed ? () => onRestore([mail.id]) : undefined}
        />
      );
    },
    [
      isSelectionMode,
      onDelete,
      onPressItem,
      onRestore,
      onActiveSelectMode,
      onSelectMail,
      onToggleUnread,
      props.session?.user.id,
      selectedFolder,
      selectedMails,
    ],
  );

  const renderPlaceholder = React.useCallback(() => <MailsPlaceholderList />, []);

  const renderContent = React.useCallback(
    (refreshControl: ScrollViewProps['refreshControl']) => (
      <PageView style={styles.page}>
        {renderTopMode()}
        {isLoading ? (
          renderPlaceholder()
        ) : (
          <FlatList
            ref={flatListRef}
            data={mails}
            renderItem={mail => renderMailPreview(mail.item)}
            ListFooterComponent={renderFooter}
            ListEmptyComponent={renderEmpty()}
            refreshControl={refreshControl}
            onEndReached={loadNextMails}
            onEndReachedThreshold={0.5}
          />
        )}
        {renderBottomMode()}
        {renderBottomSheetFolders()}
      </PageView>
    ),
    [
      isLoading,
      renderPlaceholder,
      renderTopMode,
      mails,
      renderFooter,
      renderEmpty,
      loadNextMails,
      renderBottomMode,
      renderBottomSheetFolders,
      renderMailPreview,
    ],
  );

  return <ContentLoader loadContent={loadData} renderContent={renderContent} renderLoading={renderPlaceholder} />;
};

export default connect(() => ({
  session: getSession(),
}))(MailsListScreen);
