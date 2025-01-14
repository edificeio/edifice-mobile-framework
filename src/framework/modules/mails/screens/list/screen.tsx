import * as React from 'react';
import { View } from 'react-native';

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
import { EmptyConnectionScreen, EmptyScreen } from '~/framework/components/empty-screens';
import InputContainer from '~/framework/components/inputs/container';
import { LabelIndicator } from '~/framework/components/inputs/container/label';
import TextInput from '~/framework/components/inputs/text';
import BottomSheetModal, { BottomSheetModalMethods } from '~/framework/components/modals/bottom-sheet';
import HeaderBottomSheetModal from '~/framework/components/modals/bottom-sheet/header';
import { NavBarAction } from '~/framework/components/navigation';
import { PageView } from '~/framework/components/page';
import Separator from '~/framework/components/separator';
import { BodyText } from '~/framework/components/text';
import toast from '~/framework/components/toast';
import { Toggle } from '~/framework/components/toggle';
import { ContentLoader } from '~/framework/hooks/loader';
import { getSession } from '~/framework/modules/auth/reducer';
import MailsFolderItem from '~/framework/modules/mails/components/folder-item';
import MailsMailPreview from '~/framework/modules/mails/components/mail-preview';
import MailsPlaceholderList from '~/framework/modules/mails/components/placeholder/list';
import { IMailsFolder, IMailsMailPreview, MailsDefaultFolders, MailsFolderInfo } from '~/framework/modules/mails/model';
import { MailsNavigationParams, mailsRouteNames } from '~/framework/modules/mails/navigation';
import { mailsService } from '~/framework/modules/mails/service';
import { navBarOptions, navBarTitle } from '~/framework/navigation/navBar';

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

const defaultFoldersInfos = {
  [MailsDefaultFolders.INBOX]: {
    icon: 'ui-depositeInbox',
    title: 'mails-list-inbox',
  },
  [MailsDefaultFolders.OUTBOX]: {
    icon: 'ui-send',
    title: 'mails-list-outbox',
  },
  [MailsDefaultFolders.DRAFTS]: {
    icon: 'ui-edit',
    title: 'mails-list-drafts',
  },
  [MailsDefaultFolders.TRASH]: {
    icon: 'ui-delete',
    title: 'mails-list-trash',
  },
};

const flattenFolders = (folders: IMailsFolder[]) => {
  const result: IMailsFolder[] = [];

  folders.forEach(folder => {
    result.push(folder);
    if (folder.subFolders) {
      result.push(...flattenFolders(folder.subFolders));
    }
  });

  return result;
};

const MailsListScreen = (props: MailsListScreenPrivateProps) => {
  const bottomSheetModalRef = React.useRef<BottomSheetModalMethods>(null);
  const navigation = props.navigation;

  const [selectedFolder, setSelectedFolder] = React.useState<MailsDefaultFolders | MailsFolderInfo>(MailsDefaultFolders.INBOX);
  const [isInModalCreation, setIsInModalCreation] = React.useState<boolean>(false);
  const [mails, setMails] = React.useState<IMailsMailPreview[]>([]);
  const [folders, setFolders] = React.useState<IMailsFolder[]>([]);
  const [folderCounts, setFolderCounts] = React.useState<Record<MailsDefaultFolders, number>>();
  const [valueNewFolder, setValueNewFolder] = React.useState<string>('');
  const [isSubfolder, setIsSubfolder] = React.useState<boolean>(false);
  const [idParentFolder, setIdParentFolder] = React.useState<string | undefined>(undefined);

  const loadMessages = async (folder: MailsDefaultFolders | MailsFolderInfo) => {
    try {
      const folderId = typeof folder === 'object' ? folder.id : (folder as string);
      const mailsData = await mailsService.mails.get({ folderId, pageNb: 0, pageSize: 50, unread: false });
      setMails(mailsData);
    } catch (e) {
      console.error(e);
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
          const countData = await mailsService.folder.count({
            folderId: folder,
            unread: folder === MailsDefaultFolders.DRAFTS ? false : true,
          });

          counts[folder] = countData.count;
        } catch (e) {
          console.error(`Failed to fetch count for folder: ${folder}`, e);
        }
      }
      setFolderCounts(counts);
    } catch (e) {
      console.error(e);
    }
  };

  const loadData = async (folder: MailsDefaultFolders | MailsFolderInfo) => {
    try {
      await loadMessages(folder);
      await loadFolders();
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
      headerRight: () => <NavBarAction icon="ui-edit" onPress={() => navigation.navigate(mailsRouteNames.edit, {})} />,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  React.useEffect(() => {
    props.navigation.setOptions({
      headerTitle: navBarTitle(
        I18n.get(
          Object.values(MailsDefaultFolders).includes(selectedFolder)
            ? defaultFoldersInfos[selectedFolder as MailsDefaultFolders].title
            : selectedFolder.name,
        ),
      ),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedFolder]);

  useFocusEffect(
    React.useCallback(() => {
      if (props.route.params.from) {
        loadData(props.route.params.from);
      }
    }, [props.route.params]),
  );

  const switchFolder = async (folder: MailsDefaultFolders | MailsFolderInfo) => {
    setSelectedFolder(folder);
    onDismissBottomSheet();
    await loadMessages(folder);
  };

  const onPressItem = (id: string) => {
    navigation.navigate(mailsRouteNames.details, { id, from: selectedFolder, folders });
  };

  const onDismissBottomSheet = () => {
    bottomSheetModalRef.current?.dismiss();
    if (isInModalCreation) setIsInModalCreation(false);
    if (isSubfolder) setIsSubfolder(false);
    if (idParentFolder) setIdParentFolder(undefined);
  };

  const onToggleSubfolders = () => {
    setIsSubfolder(!isSubfolder);
    setIdParentFolder(undefined);
  };

  const onCreateNewFolder = async () => {
    try {
      const dataNewFolder = await mailsService.folder.create({ name: valueNewFolder, parentId: idParentFolder ?? '' });
      switchFolder({ name: valueNewFolder, id: dataNewFolder });
      loadFolders();
      setValueNewFolder('');
      toast.showSuccess(I18n.get('mails-list-newfoldersuccess', { name: valueNewFolder }));
    } catch (e) {
      console.error('Failed to create new folder', e);
      onDismissBottomSheet();
      toast.showError();
    }
  };

  const onTrash = async (id: string) => {
    try {
      await mailsService.mail.moveToTrash({ ids: [id] });
      loadMessages(selectedFolder);
      toast.showSuccess(I18n.get('mails-list-trashmessage'));
    } catch (e) {
      console.error(e);
    }
  };

  const onDelete = async (id: string) => {
    try {
      await mailsService.mail.delete({ ids: [id] });
      loadMessages(selectedFolder);
      toast.showSuccess(I18n.get('mails-list-deletemessage'));
    } catch (e) {
      console.error(e);
    }
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
              {Object.keys(defaultFoldersInfos).map(folder => (
                <MailsFolderItem
                  key={folder}
                  icon={defaultFoldersInfos[folder].icon}
                  name={I18n.get(defaultFoldersInfos[folder].title)}
                  selected={selectedFolder === folder}
                  onPress={() => switchFolder(folder as MailsDefaultFolders)}
                  nbUnread={folderCounts[folder]}
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
            selected={selectedFolder.id === item.id}
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
      <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
        <View style={styles.scrollViewBottomSheet}>
          <HeaderBottomSheetModal
            title={I18n.get('mails-list-newfolder')}
            iconRight="ui-check"
            iconRightDisabled={(isSubfolder && !idParentFolder) || valueNewFolder.length === 0}
            onPressRight={onCreateNewFolder}
          />
          <InputContainer
            label={{ icon: 'ui-folder', indicator: LabelIndicator.REQUIRED, text: I18n.get('mails-list-newfolderlabel') }}
            input={
              <TextInput
                placeholder={I18n.get('mails-list-newfolderplaceholder')}
                onChangeText={text => setValueNewFolder(text)}
                value={valueNewFolder}
                maxLength={50}
              />
            }
          />
          <Separator marginVertical={UI_SIZES.spacing.medium} marginHorizontal={UI_SIZES.spacing.small} />
          <View style={styles.selectFolderTitle}>
            <BodyText>{I18n.get('mails-list-newfoldersubtitle')}</BodyText>
            <Toggle checked={isSubfolder} onCheckChange={onToggleSubfolders} color={theme.palette.primary} />
          </View>
          {isSubfolder ? (
            <View style={stylesFolders.containerFolders}>
              <FlatList
                data={folders}
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
            </View>
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

  const renderContent = () => (
    <PageView>
      <FlashList
        data={mails}
        renderItem={mail => {
          return (
            <MailsMailPreview
              data={mail.item}
              onPress={() => onPressItem(mail.item.id)}
              isSender={props.session?.user.id === mail.item.from.id}
              onDelete={selectedFolder === MailsDefaultFolders.TRASH ? () => onDelete(mail.item.id) : () => onTrash(mail.item.id)}
            />
          );
        }}
        ListEmptyComponent={renderEmpty()}
      />
      {renderBottomSheetFolders()}
    </PageView>
  );

  return (
    <ContentLoader
      loadContent={() => loadData(MailsDefaultFolders.INBOX)}
      renderContent={renderContent}
      renderError={() => <EmptyConnectionScreen />}
      renderLoading={() => <MailsPlaceholderList />}
    />
  );
};

export default connect(() => ({
  session: getSession(),
}))(MailsListScreen);
