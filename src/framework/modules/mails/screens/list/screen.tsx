import * as React from 'react';
import { ScrollViewProps, View } from 'react-native';

import type { NativeStackNavigationOptions, NativeStackScreenProps } from '@react-navigation/native-stack';
import { FlashList } from '@shopify/flash-list';
import { connect } from 'react-redux';

import stylesFolders from '~/framework/modules/mails/components/folder-item/styles';
import styles from './styles';
import type { MailsListScreenPrivateProps } from './types';

import { useFocusEffect } from '@react-navigation/native';
import { FlatList, ScrollView } from 'react-native-gesture-handler';
import { I18n } from '~/app/i18n';
import theme from '~/app/theme';
import TertiaryButton from '~/framework/components/buttons/tertiary';
import { UI_SIZES } from '~/framework/components/constants';
import { EmptyScreen } from '~/framework/components/empty-screens';
import InputContainer from '~/framework/components/inputs/container';
import { LabelIndicator } from '~/framework/components/inputs/container/label';
import TextInput from '~/framework/components/inputs/text';
import BottomSheetModal, { BottomSheetModalMethods } from '~/framework/components/modals/bottom-sheet';
import HeaderBottomSheetModal from '~/framework/components/modals/bottom-sheet/header';
import { NavBarAction } from '~/framework/components/navigation';
import { PageView } from '~/framework/components/page';
import Separator from '~/framework/components/separator';
import { BodyText, TextSizeStyle } from '~/framework/components/text';
import toast from '~/framework/components/toast';
import { Toggle } from '~/framework/components/toggle';
import { ContentLoader } from '~/framework/hooks/loader';
import { getSession } from '~/framework/modules/auth/reducer';
import MailsFolderItem from '~/framework/modules/mails/components/folder-item';
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
const ESTIMATED_ITEM_SIZE = UI_SIZES.spacing.small * 2 + TextSizeStyle.Normal.lineHeight * 2;

const MailsListScreen = (props: MailsListScreenPrivateProps) => {
  const bottomSheetModalRef = React.useRef<BottomSheetModalMethods>(null);
  const flatListRef = React.useRef<FlashList<IMailsMailPreview>>(null);
  const navigation = props.navigation;

  const [selectedFolder, setSelectedFolder] = React.useState<MailsDefaultFolders | MailsFolderInfo>(MailsDefaultFolders.INBOX);
  const [isInModalCreation, setIsInModalCreation] = React.useState<boolean>(false);
  const [pageNb, setPageNb] = React.useState<number>(0);
  const [isLoadingNextPage, setIsLoadingNextPage] = React.useState<boolean>(false);
  const [hasNextMails, setHasNextMails] = React.useState<boolean>(true);
  const [mails, setMails] = React.useState<IMailsMailPreview[]>([]);
  const [folders, setFolders] = React.useState<IMailsFolder[]>([]);
  const [folderCounts, setFolderCounts] = React.useState<Record<MailsDefaultFolders, number>>();
  const [valueNewFolder, setValueNewFolder] = React.useState<string>('');
  const [isSubfolder, setIsSubfolder] = React.useState<boolean>(false);
  const [idParentFolder, setIdParentFolder] = React.useState<string | undefined>(undefined);
  const [isLoadingCreateNewFolder, setIsLoadingCreateNewFolder] = React.useState<boolean>(false);
  const [onErrorCreateFolder, setOnErrorCreateFolder] = React.useState<boolean>(false);

  const loadMails = async (folder: MailsDefaultFolders | MailsFolderInfo) => {
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
  };

  const loadNextMails = async () => {
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
  };

  const loadFolders = async () => {
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
  };

  const loadData = async () => {
    try {
      await Promise.all([loadMails(selectedFolder), loadFolders()]);
    } catch (e) {
      console.error(e);
    }
  };

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
        <NavBarAction icon="ui-edit" onPress={() => navigation.navigate(mailsRouteNames.edit, { fromFolder: selectedFolder })} />
      ),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedFolder, props.navigation]);

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
  }, [selectedFolder]);

  useFocusEffect(
    React.useCallback(() => {
      const { params } = props.route;
      if (params.fromFolder) {
        if (params.reload) loadMails(params.fromFolder);
        if (params.idMailToRemove) setMails(mails => mails.filter(mail => mail.id !== params.idMailToRemove));
        if (params.idMailToMarkUnread)
          setMails(mails => mails.map(mail => (mail.id === params.idMailToMarkUnread ? { ...mail, unread: true } : mail)));
        setSelectedFolder(params.fromFolder);
        loadFolders();
      }
    }, [props.route.params, selectedFolder]),
  );

  const switchFolder = async (folder: MailsDefaultFolders | MailsFolderInfo) => {
    setSelectedFolder(folder);
    onDismissBottomSheet();
    await loadMails(folder);
    flatListRef.current?.scrollToOffset({ animated: true, offset: 0 });
  };

  const onPressItem = (id: string, unread: boolean, state: MailsMailStatePreview) => {
    if (state === MailsMailStatePreview.DRAFT && selectedFolder !== MailsDefaultFolders.TRASH) {
      return navigation.navigate(mailsRouteNames.edit, { draftId: id, fromFolder: selectedFolder });
    }

    if (unread) setMails(mails => mails.map(mail => (mail.id === id ? { ...mail, unread: false } : mail)));
    return navigation.navigate(mailsRouteNames.details, { id, fromFolder: selectedFolder, folders });
  };

  const onDismissBottomSheet = () => {
    bottomSheetModalRef.current?.dismiss();
    if (valueNewFolder) setValueNewFolder('');
    if (isInModalCreation) setIsInModalCreation(false);
    if (isSubfolder) setIsSubfolder(false);
    if (idParentFolder) setIdParentFolder(undefined);
    if (onErrorCreateFolder) setOnErrorCreateFolder(false);
  };

  const onToggleSubfolders = () => {
    setIsSubfolder(!isSubfolder);
    setIdParentFolder(undefined);
  };

  const onCreateNewFolder = async () => {
    try {
      setIsLoadingCreateNewFolder(true);
      const dataNewFolder = await mailsService.folder.create({ name: valueNewFolder, parentId: idParentFolder ?? '' });
      switchFolder({ name: valueNewFolder, id: dataNewFolder });
      loadFolders();
      setValueNewFolder('');
      toast.showSuccess(I18n.get('mails-list-newfoldersuccess', { name: valueNewFolder }));
    } catch (e) {
      const error = e instanceof HTTPError ? await e.json() : e;
      if (error instanceof Error) return toast.showError();
      if (error && error.error === 'conversation.error.duplicate.folder') setOnErrorCreateFolder(true);
    } finally {
      setIsLoadingCreateNewFolder(false);
    }
  };

  const handleMailAction = async ({
    action,
    updateMails,
    successMessage,
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
  };

  const onDelete = async (id: string, permanently?: boolean) => {
    await handleMailAction({
      action: () => (permanently ? mailsService.mail.delete({ ids: [id] }) : mailsService.mail.moveToTrash({ ids: [id] })),
      updateMails: () => setMails(mails => mails.filter(mail => mail.id !== id)),
      successMessage: permanently ? 'mails-details-toastsuccessdelete' : 'mails-details-toastsuccesstrash',
    });
  };

  const onToggleUnread = async (id: string, unread: boolean) => {
    await handleMailAction({
      action: () => mailsService.mail.toggleUnread({ ids: [id], unread: !unread }),
      updateMails: () => setMails(mails => mails.map(mail => (mail.id === id ? { ...mail, unread: !unread } : mail))),
      successMessage: unread ? 'mails-details-toastsuccessread' : 'mails-details-toastsuccessunread',
    });
  };

  const onRestore = async (id: string) => {
    await handleMailAction({
      action: () => mailsService.mail.restore({ ids: [id] }),
      updateMails: () => setMails(mails => mails.filter(mail => mail.id !== id)),
      successMessage: 'mails-details-toastsuccessrestore',
    });
  };

  const renderFolders = () => {
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
            action={() => setIsInModalCreation(true)}
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
  };

  const renderCreateNewFolder = () => {
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
              (isSubfolder && !idParentFolder) || valueNewFolder.length === 0 || onErrorCreateFolder || isLoadingCreateNewFolder
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
                  setValueNewFolder(text);
                }}
                value={valueNewFolder}
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
                  contentContainerStyle={stylesFolders.containerFolders}
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
  };

  const renderBottomSheetFolders = () => {
    return (
      <BottomSheetModal
        ref={bottomSheetModalRef}
        onDismiss={onDismissBottomSheet}
        snapPoints={['90%']}
        enableDynamicSizing={isInModalCreation ? false : true}
        containerStyle={styles.bottomSheet}>
        {isInModalCreation ? renderCreateNewFolder() : renderFolders()}
      </BottomSheetModal>
    );
  };

  const renderEmpty = () => {
    return (
      <EmptyScreen
        svgImage={selectedFolder === MailsDefaultFolders.TRASH ? 'empty-trash' : 'empty-conversation'}
        title={I18n.get(selectedFolder === MailsDefaultFolders.TRASH ? 'mails-list-emptytitletrash' : 'mails-list-emptytitle')}
        textColor={theme.palette.grey.black}
        text={I18n.get(selectedFolder === MailsDefaultFolders.TRASH ? 'mails-list-emptytexttrash' : 'mails-list-emptytext')}
      />
    );
  };

  const renderFooter = () => (isLoadingNextPage ? <MailsPlaceholderLittleList /> : null);

  const renderContent = (refreshControl: ScrollViewProps['refreshControl']) => (
    <PageView>
      <FlashList
        ref={flatListRef}
        data={mails}
        estimatedItemSize={ESTIMATED_ITEM_SIZE}
        estimatedListSize={{ height: mails.length * ESTIMATED_ITEM_SIZE, width: UI_SIZES.screen.width }}
        renderItem={mail => {
          return (
            <MailsMailPreview
              key={mail.item.id}
              data={mail.item}
              onPress={() => onPressItem(mail.item.id, mail.item.unread, mail.item.state)}
              isSender={props.session?.user.id === mail.item.from?.id && selectedFolder !== MailsDefaultFolders.INBOX}
              onDelete={() => onDelete(mail.item.id, selectedFolder === MailsDefaultFolders.TRASH ? true : false)}
              onToggleUnread={
                selectedFolder !== MailsDefaultFolders.DRAFTS &&
                selectedFolder !== MailsDefaultFolders.OUTBOX &&
                selectedFolder !== MailsDefaultFolders.TRASH
                  ? () => onToggleUnread(mail.item.id, mail.item.unread)
                  : undefined
              }
              onRestore={selectedFolder === MailsDefaultFolders.TRASH ? () => onRestore(mail.item.id) : undefined}
            />
          );
        }}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmpty()}
        refreshControl={refreshControl}
        onEndReached={loadNextMails}
        onEndReachedThreshold={0.5}
      />
      {renderBottomSheetFolders()}
    </PageView>
  );
  return <ContentLoader loadContent={loadData} renderContent={renderContent} renderLoading={() => <MailsPlaceholderList />} />;
};

export default connect(() => ({
  session: getSession(),
}))(MailsListScreen);
