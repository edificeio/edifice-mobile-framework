import * as React from 'react';
import { Alert, ScrollViewProps, View } from 'react-native';

import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackNavigationOptions, NativeStackScreenProps } from '@react-navigation/native-stack';
import { FlatList, ScrollView } from 'react-native-gesture-handler';
import { connect } from 'react-redux';

import styles from './styles';
import type { MailsListScreenPrivateProps } from './types';

import { I18n } from '~/app/i18n';
import theme from '~/app/theme';
import TertiaryButton from '~/framework/components/buttons/tertiary';
import { Checkbox } from '~/framework/components/checkbox';
import { UI_SIZES } from '~/framework/components/constants';
import { EmptyScreen } from '~/framework/components/empty-screens';
import InputContainer from '~/framework/components/inputs/container';
import { LabelIndicator } from '~/framework/components/inputs/container/label';
import TextInput from '~/framework/components/inputs/text';
import { deleteAction } from '~/framework/components/menus/actions';
import PopupMenu from '~/framework/components/menus/popup';
import BottomSheetModal, { BottomSheetModalMethods } from '~/framework/components/modals/bottom-sheet';
import HeaderBottomSheetModal from '~/framework/components/modals/bottom-sheet/header';
import { NavBarAction, NavBarActionsGroup } from '~/framework/components/navigation';
import { PageView } from '~/framework/components/page';
import Separator from '~/framework/components/separator';
import { BodyBoldText, BodyText } from '~/framework/components/text';
import toast from '~/framework/components/toast';
import { Toggle } from '~/framework/components/toggle';
import { ContentLoader } from '~/framework/hooks/loader';
import { getSession } from '~/framework/modules/auth/reducer';
import MailsFolderItem from '~/framework/modules/mails/components/folder-item';
import stylesFolders from '~/framework/modules/mails/components/folder-item/styles';
import MailsMailPreview from '~/framework/modules/mails/components/mail-preview';
import { MailsPlaceholderList, MailsPlaceholderLittleList } from '~/framework/modules/mails/components/placeholder/list';
import {
  IMailsFolder,
  IMailsMailPreview,
  MailsDefaultFolders,
  MailsFolderInfo,
  MailsMailStatePreview,
} from '~/framework/modules/mails/model';
import { MailsNavigationParams, mailsRouteNames } from '~/framework/modules/mails/navigation';
import { mailsService } from '~/framework/modules/mails/service';
import { flattenFolders, mailsDefaultFoldersInfos } from '~/framework/modules/mails/util';
import { navBarOptions, navBarTitle } from '~/framework/navigation/navBar';
import { HTTPError } from '~/framework/util/http';

enum MailsListTypeModalCreation {
  CREATE = 'CREATE',
  RENAME = 'RENAME',
}

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

const MailsListScreen = (props: MailsListScreenPrivateProps) => {
  const bottomSheetModalRef = React.useRef<BottomSheetModalMethods>(null);
  const flatListRef = React.useRef<FlatList<IMailsMailPreview>>(null);
  const navigation = props.navigation;

  const [selectedFolder, setSelectedFolder] = React.useState<MailsDefaultFolders | MailsFolderInfo>(MailsDefaultFolders.INBOX);
  const [typeModalCreation, setTypeModalCreation] = React.useState<MailsListTypeModalCreation | undefined>(undefined);
  const [pageNb, setPageNb] = React.useState<number>(0);
  const [isLoadingNextPage, setIsLoadingNextPage] = React.useState<boolean>(false);
  const [hasNextMails, setHasNextMails] = React.useState<boolean>(true);
  const [mails, setMails] = React.useState<IMailsMailPreview[]>([]);
  const [folders, setFolders] = React.useState<IMailsFolder[]>([]);
  const [folderCounts, setFolderCounts] = React.useState<Record<MailsDefaultFolders, number>>();
  const [valueFolderName, setValueFolderName] = React.useState<string>('');
  const [isSubfolder, setIsSubfolder] = React.useState<boolean>(false);
  const [idParentFolder, setIdParentFolder] = React.useState<string | undefined>(undefined);
  const [isLoadingCreateNewFolder, setIsLoadingCreateNewFolder] = React.useState<boolean>(false);
  const [onErrorCreateFolder, setOnErrorCreateFolder] = React.useState<boolean>(false);
  const [isSelectionMode, setIsSelectionMode] = React.useState<boolean>(false);
  const [selectedMails, setSelectedMails] = React.useState<string[]>([]);

  const loadMails = React.useCallback(
    async (folder: MailsDefaultFolders | MailsFolderInfo) => {
      try {
        setPageNb(0);
        if (!hasNextMails) setHasNextMails(true);
        const folderId = typeof folder === 'object' ? folder.id : (folder as string);
        const mailsData = await mailsService.mails.get({
          folderId,
          pageNb: 0,
          pageSize: PAGE_SIZE,
          unread: false,
        });
        setMails(mailsData);
      } catch (e) {
        console.error(e);
      }
    },
    [hasNextMails, setHasNextMails, setMails],
  );

  const loadNextMails = React.useCallback(async () => {
    try {
      if (mails.length < PAGE_SIZE * (pageNb + 1) || !hasNextMails) return;
      setIsLoadingNextPage(true);
      const folderId = typeof selectedFolder === 'object' ? selectedFolder.id : selectedFolder;
      const mailsData = await mailsService.mails.get({ folderId, pageNb: pageNb + 1, pageSize: PAGE_SIZE, unread: false });
      if (mailsData.length === 0) return setHasNextMails(false);
      setMails([...mails, ...mailsData]);
      setPageNb(pageNb + 1);
    } catch (e) {
      console.error(e);
      toast.showError();
    } finally {
      setIsLoadingNextPage(false);
    }
  }, [hasNextMails, pageNb, selectedFolder, mails, setMails, setHasNextMails, setPageNb]);

  const loadFolders = React.useCallback(async () => {
    try {
      const foldersData = await mailsService.folders.get({ depth: 2 });
      const flattenedFolders = flattenFolders(foldersData);
      setFolders(flattenedFolders);

      const counts: Record<string, number> = {};
      for (const folder of Object.values(MailsDefaultFolders)) {
        try {
          if (folder === MailsDefaultFolders.OUTBOX) {
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
      await Promise.all([loadMails(selectedFolder), loadFolders()]);
    } catch (e) {
      console.error(e);
    }
  }, [loadMails, loadFolders, selectedFolder]);

  const onDismissBottomSheet = React.useCallback(() => {
    bottomSheetModalRef.current?.dismiss();
    if (valueFolderName) setValueFolderName('');
    if (typeModalCreation) setTypeModalCreation(undefined);
    if (isSubfolder) setIsSubfolder(false);
    if (idParentFolder) setIdParentFolder(undefined);
    if (onErrorCreateFolder) setOnErrorCreateFolder(false);
  }, [valueFolderName, typeModalCreation, isSubfolder, idParentFolder, onErrorCreateFolder]);

  const switchFolder = React.useCallback(
    async (folder: MailsDefaultFolders | MailsFolderInfo) => {
      setSelectedFolder(folder);
      onDismissBottomSheet();
      await loadMails(folder);
      flatListRef.current?.scrollToOffset({ animated: true, offset: 0 });
    },
    [loadMails, setSelectedFolder, onDismissBottomSheet],
  );

  const onPressItem = React.useCallback(
    (id: string, unread: boolean, state: MailsMailStatePreview) => {
      if (state === MailsMailStatePreview.DRAFT && selectedFolder !== MailsDefaultFolders.TRASH)
        return navigation.navigate(mailsRouteNames.edit, { draftId: id, fromFolder: selectedFolder });
      if (unread) setMails(mails => mails.map(mail => (mail.id === id ? { ...mail, unread: false } : mail)));
      return navigation.navigate(mailsRouteNames.details, { folders, from: selectedFolder, id });
    },
    [selectedFolder, navigation, setMails, folders],
  );

  const onToggleSubfolders = React.useCallback(() => {
    setIsSubfolder(!isSubfolder);
    setIdParentFolder(undefined);
  }, [isSubfolder, setIsSubfolder, setIdParentFolder]);

  const onCreateNewFolder = React.useCallback(async () => {
    try {
      setIsLoadingCreateNewFolder(true);
      const dataNewFolder = await mailsService.folder.create({ name: valueFolderName, parentId: idParentFolder ?? '' });
      switchFolder({ id: dataNewFolder, name: valueFolderName });
      loadFolders();
      onDismissBottomSheet();
      toast.showSuccess(I18n.get('mails-list-newfoldersuccess', { name: valueFolderName }));
    } catch (e) {
      const error = e instanceof HTTPError ? await e.json() : e;
      if (error instanceof Error) return toast.showError();
      if (error && error.error === 'conversation.error.duplicate.folder') setOnErrorCreateFolder(true);
    } finally {
      setIsLoadingCreateNewFolder(false);
    }
  }, [valueFolderName, idParentFolder, switchFolder, loadFolders, onDismissBottomSheet]);

  const onRenameFolderAction = React.useCallback(async () => {
    try {
      setIsLoadingCreateNewFolder(true);
      await mailsService.folder.rename({ id: (selectedFolder as MailsFolderInfo).id }, { name: valueFolderName });
      setSelectedFolder({ id: (selectedFolder as MailsFolderInfo).id, name: valueFolderName });
      loadFolders();
      onDismissBottomSheet();
      toast.showSuccess(I18n.get('mails-list-renamefoldersuccess'));
    } catch (e) {
      const error = e instanceof HTTPError ? await e.json() : e;
      if (error instanceof Error) return toast.showError();
      if (error && error.error === 'conversation.error.duplicate.folder') setOnErrorCreateFolder(true);
    } finally {
      setIsLoadingCreateNewFolder(false);
    }
  }, [loadFolders, onDismissBottomSheet, selectedFolder, valueFolderName]);

  const onRenameFolder = React.useCallback(() => {
    setValueFolderName((selectedFolder as MailsFolderInfo).name);
    setTypeModalCreation(MailsListTypeModalCreation.RENAME);
    bottomSheetModalRef.current?.present();
  }, [selectedFolder]);

  const onActiveSelectMode = React.useCallback(() => {
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
    [onConfigureSignature, onDeleteFolder, onRenameFolder, onActiveSelectMode],
  );

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
            <PopupMenu actions={selectedFolder && selectedFolder.id ? allPopupActionsMenu : allPopupActionsMenu.slice(0, 2)}>
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
      ),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedFolder, navigation]);

  React.useEffect(() => {
    props.navigation.setOptions({
      headerShown: !isSelectionMode,
    });
    props.navigation.setParams({ tabBarVisible: !isSelectionMode });
  }, [isSelectionMode, props.navigation]);

  useFocusEffect(
    React.useCallback(() => {
      const { params } = props.route;
      if (params.from && (params.reload || params.idMailToRemove || params.idMailToMarkUnread)) {
        if (params.reload) loadMails(params.from);
        if (params.idMailToRemove) setMails(mails => mails.filter(mail => mail.id !== params.idMailToRemove));
        if (params.idMailToMarkUnread)
          setMails(mails => mails.map(mail => (mail.id === params.idMailToMarkUnread ? { ...mail, unread: true } : mail)));
        setSelectedFolder(params.from);
        loadFolders();
      } else {
        //loadFolders();
      }
    }, [loadFolders, loadMails, props.route]),
  );

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
    async (id: string, permanently?: boolean) => {
      await handleMailAction({
        action: () => (permanently ? mailsService.mail.delete({ ids: [id] }) : mailsService.mail.moveToTrash({ ids: [id] })),
        successMessage: permanently ? 'mails-details-toastsuccessdelete' : 'mails-details-toastsuccesstrash',
        updateMails: () => setMails(mails => mails.filter(mail => mail.id !== id)),
      });
    },
    [handleMailAction],
  );

  const onToggleUnread = React.useCallback(
    async (id: string, unread: boolean) => {
      await handleMailAction({
        action: () => mailsService.mail.toggleUnread({ ids: [id], unread: !unread }),
        successMessage: unread ? 'mails-details-toastsuccessread' : 'mails-details-toastsuccessunread',
        updateMails: () => setMails(mails => mails.map(mail => (mail.id === id ? { ...mail, unread: !unread } : mail))),
      });
    },
    [handleMailAction],
  );

  const onRestore = React.useCallback(
    async (id: string) => {
      await handleMailAction({
        action: () => mailsService.mail.restore({ ids: [id] }),
        successMessage: 'mails-details-toastsuccessrestore',
        updateMails: () => setMails(mails => mails.filter(mail => mail.id !== id)),
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

  const featureNotImplemented = React.useCallback(() => {
    Alert.alert('This feature is not implemented yet');
  }, []);

  const renderTopSelectMode = React.useCallback(() => {
    if (!isSelectionMode) return;
    return (
      <View style={[styles.selectMode, styles.selectModeTop]}>
        <View style={styles.selectModeTopText}>
          <Checkbox onPress={onSelectAll} checked={mails.length === selectedMails.length} />
          <BodyBoldText>{I18n.get('mails-list-selectall')}</BodyBoldText>
        </View>
        <TertiaryButton text={I18n.get('common-cancel')} action={onDisableSelectMode} style={styles.selectModeTopButton} />
      </View>
    );
  }, [isSelectionMode, mails, onDisableSelectMode, onSelectAll, selectedMails]);

  const renderBottomSelectMode = React.useCallback(() => {
    if (!isSelectionMode) return;
    return (
      <View style={[styles.selectMode, styles.selectModeBottom]}>
        <BodyBoldText style={styles.selectModeBottomText}>
          {I18n.get(selectedMails.length > 1 ? 'mails-list-selectcountplural' : 'mails-list-selectcount', {
            nb: selectedMails.length,
          })}
        </BodyBoldText>
        <TertiaryButton iconLeft="ui-mailUnread" contentColor={theme.palette.primary.regular} action={featureNotImplemented} />
        <TertiaryButton iconLeft="ui-mailRead" contentColor={theme.palette.primary.regular} action={featureNotImplemented} />
        <TertiaryButton iconLeft="ui-folderMove" contentColor={theme.palette.primary.regular} action={featureNotImplemented} />
        <TertiaryButton iconLeft="ui-delete" contentColor={theme.palette.status.failure.regular} action={featureNotImplemented} />
      </View>
    );
  }, [featureNotImplemented, isSelectionMode, selectedMails.length]);

  const renderFolders = React.useCallback(() => {
    return (
      <FlatList
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
            action={() => setTypeModalCreation(MailsListTypeModalCreation.CREATE)}
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
    return (
      <ScrollView
        keyboardDismissMode="none"
        keyboardShouldPersistTaps="always"
        nestedScrollEnabled
        showsVerticalScrollIndicator={false}
        bounces={false}>
        <View style={styles.scrollViewBottomSheet}>
          <HeaderBottomSheetModal
            title={I18n.get('mails-list-newfolder')}
            iconRight="ui-check"
            iconRightDisabled={
              (isSubfolder && !idParentFolder) || valueFolderName.length === 0 || onErrorCreateFolder || isLoadingCreateNewFolder
            }
            onPressRight={onCreateNewFolder}
          />
          <InputContainer
            label={{ icon: 'ui-folder', indicator: LabelIndicator.REQUIRED, text: I18n.get('mails-list-newfolderlabel') }}
            input={
              <TextInput
                placeholder={I18n.get('mails-list-newfolderplaceholder')}
                onChangeText={text => {
                  if (onErrorCreateFolder) setOnErrorCreateFolder(false);
                  setValueFolderName(text);
                }}
                value={valueFolderName}
                showError={onErrorCreateFolder}
                annotation={onErrorCreateFolder ? I18n.get('mails-list-newfolderduplicate') : undefined}
                maxLength={50}
              />
            }
          />
          {folders.length > 0 ? (
            <>
              <Separator marginVertical={UI_SIZES.spacing.medium} marginHorizontal={UI_SIZES.spacing.small} />
              <View style={styles.selectFolderTitle}>
                <BodyText>{I18n.get('mails-list-newfoldersubtitle')}</BodyText>
                <Toggle checked={isSubfolder} onCheckChange={onToggleSubfolders} color={theme.palette.primary} />
              </View>
              {isSubfolder ? (
                <FlatList
                  data={folders}
                  contentContainerStyle={[stylesFolders.containerFolders, styles.flatListBottomSheet]}
                  renderItem={({ item }) =>
                    item.depth === 1 ? (
                      <MailsFolderItem
                        key={item.id}
                        icon="ui-folder"
                        name={item.name}
                        selected={idParentFolder === item.id}
                        onPress={() => (idParentFolder !== item.id ? setIdParentFolder(item.id) : {})}
                      />
                    ) : null
                  }
                />
              ) : null}
            </>
          ) : null}
        </View>
      </ScrollView>
    );
  }, [
    folders,
    valueFolderName,
    onErrorCreateFolder,
    isLoadingCreateNewFolder,
    isSubfolder,
    idParentFolder,
    onCreateNewFolder,
    onToggleSubfolders,
  ]);

  const renderRenameFolder = React.useCallback(() => {
    return (
      <ScrollView
        keyboardDismissMode="none"
        keyboardShouldPersistTaps="always"
        nestedScrollEnabled
        showsVerticalScrollIndicator={false}
        bounces={false}>
        <HeaderBottomSheetModal
          title={I18n.get('mails-list-rename')}
          iconRight="ui-check"
          iconRightDisabled={
            onErrorCreateFolder || valueFolderName.length === 0 || valueFolderName === (selectedFolder as MailsFolderInfo).name
          }
          onPressRight={onRenameFolderAction}
        />
        <InputContainer
          label={{ icon: 'ui-folder', text: I18n.get('mails-list-renamefolderlabel') }}
          input={
            <TextInput
              placeholder={I18n.get('mails-list-newfolderplaceholder')}
              onChangeText={text => {
                if (onErrorCreateFolder) setOnErrorCreateFolder(false);
                setValueFolderName(text);
              }}
              value={valueFolderName}
              showError={onErrorCreateFolder}
              annotation={onErrorCreateFolder ? I18n.get('mails-list-newfolderduplicate') : undefined}
              maxLength={50}
            />
          }
        />
      </ScrollView>
    );
  }, [valueFolderName, selectedFolder, onRenameFolderAction, onErrorCreateFolder]);

  const renderContentBottomSheet = React.useCallback(() => {
    switch (typeModalCreation) {
      case MailsListTypeModalCreation.CREATE:
        return renderCreateNewFolder();
      case MailsListTypeModalCreation.RENAME:
        return renderRenameFolder();
      default:
        return renderFolders();
    }
  }, [typeModalCreation, renderCreateNewFolder, renderRenameFolder, renderFolders]);

  const renderBottomSheetFolders = React.useCallback(() => {
    return (
      <BottomSheetModal
        ref={bottomSheetModalRef}
        onDismiss={onDismissBottomSheet}
        snapPoints={['90%']}
        enableDynamicSizing={typeModalCreation ? false : true}
        containerStyle={styles.bottomSheet}>
        {renderContentBottomSheet()}
      </BottomSheetModal>
    );
  }, [onDismissBottomSheet, typeModalCreation, renderContentBottomSheet]);

  const renderEmpty = React.useCallback(() => {
    return (
      <EmptyScreen
        svgImage={selectedFolder === MailsDefaultFolders.TRASH ? 'empty-trash' : 'empty-conversation'}
        title={I18n.get(selectedFolder === MailsDefaultFolders.TRASH ? 'mails-list-emptytitletrash' : 'mails-list-emptytitle')}
        textColor={theme.palette.grey.black}
        text={I18n.get(selectedFolder === MailsDefaultFolders.TRASH ? 'mails-list-emptytexttrash' : 'mails-list-emptytext')}
        customStyle={styles.emptyscreen}
      />
    );
  }, [selectedFolder]);

  const renderFooter = React.useCallback(() => (isLoadingNextPage ? <MailsPlaceholderLittleList /> : null), [isLoadingNextPage]);

  const renderMailPreview = React.useCallback(
    (mail: IMailsMailPreview) => (
      <MailsMailPreview
        key={mail.id}
        data={mail}
        onPress={() => onPressItem(mail.id, mail.unread, mail.state)}
        isSender={props.session?.user.id === mail.from?.id && selectedFolder !== MailsDefaultFolders.INBOX}
        isSelectMode={isSelectionMode}
        isSelected={selectedMails.includes(mail.id)}
        onSelect={onSelectMail}
        onDelete={() => onDelete(mail.id, selectedFolder === MailsDefaultFolders.TRASH ? true : false)}
        onToggleUnread={
          selectedFolder !== MailsDefaultFolders.DRAFTS &&
          selectedFolder !== MailsDefaultFolders.OUTBOX &&
          selectedFolder !== MailsDefaultFolders.TRASH
            ? () => onToggleUnread(mail.id, mail.unread)
            : undefined
        }
        onRestore={selectedFolder === MailsDefaultFolders.TRASH ? () => onRestore(mail.id) : undefined}
      />
    ),
    [
      isSelectionMode,
      onDelete,
      onPressItem,
      onRestore,
      onSelectMail,
      onToggleUnread,
      props.session?.user.id,
      selectedFolder,
      selectedMails,
    ],
  );

  const renderContent = React.useCallback(
    (refreshControl: ScrollViewProps['refreshControl']) => (
      <PageView style={styles.page}>
        {renderTopSelectMode()}
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
        {renderBottomSelectMode()}
        {renderBottomSheetFolders()}
      </PageView>
    ),
    [
      renderTopSelectMode,
      mails,
      renderFooter,
      renderEmpty,
      loadNextMails,
      renderBottomSelectMode,
      renderBottomSheetFolders,
      renderMailPreview,
    ],
  );

  return <ContentLoader loadContent={loadData} renderContent={renderContent} renderLoading={() => <MailsPlaceholderList />} />;
};

export default connect(() => ({
  session: getSession(),
}))(MailsListScreen);
