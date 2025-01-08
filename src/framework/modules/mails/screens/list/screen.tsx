import * as React from 'react';
import { View } from 'react-native';

import type { NativeStackNavigationOptions, NativeStackScreenProps } from '@react-navigation/native-stack';
import { FlashList } from '@shopify/flash-list';
import { connect } from 'react-redux';

import styles from './styles';
import type { MailsListScreenPrivateProps } from './types';

import { I18n } from '~/app/i18n';
import theme from '~/app/theme';
import TertiaryButton from '~/framework/components/buttons/tertiary';
import { UI_SIZES } from '~/framework/components/constants';
import { EmptyConnectionScreen, EmptyScreen } from '~/framework/components/empty-screens';
import InputContainer from '~/framework/components/inputs/container';
import { LabelIndicator } from '~/framework/components/inputs/container/label';
import TextInput from '~/framework/components/inputs/text';
import BottomSheetModal, { BottomSheetModalMethods } from '~/framework/components/modals/bottom-sheet';
import { NavBarAction } from '~/framework/components/navigation';
import { PageView } from '~/framework/components/page';
import Separator from '~/framework/components/separator';
import { BodyText, HeadingXSText, SmallBoldText } from '~/framework/components/text';
import { ContentLoader } from '~/framework/hooks/loader';
import { getSession } from '~/framework/modules/auth/reducer';
import MailsFolderItem from '~/framework/modules/mails/components/folder-item';
import MailsMailPreview from '~/framework/modules/mails/components/mail-preview';
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

  const switchFolder = async (folder: MailsDefaultFolders | MailsFolderInfo) => {
    setSelectedFolder(folder);
    bottomSheetModalRef.current?.dismiss();
    await loadMessages(folder);
  };

  const onPressItem = () => {
    navigation.navigate(mailsRouteNames.details, { from: selectedFolder });
  };

  const onDismissBottomSheet = () => {
    if (isInModalCreation) setIsInModalCreation(false);
  };

  const renderFolders = () => {
    return (
      <View>
        <View style={styles.defaultFolders}>
          {Object.keys(defaultFoldersInfos).map(folder => (
            <MailsFolderItem
              key={folder}
              icon={defaultFoldersInfos[folder].icon}
              name={I18n.get(defaultFoldersInfos[folder].title)}
              selected={selectedFolder === folder}
              onPress={() => switchFolder(folder as MailsDefaultFolders)}
            />
          ))}
        </View>
        <Separator marginHorizontal={UI_SIZES.spacing.small} marginVertical={UI_SIZES.spacing.medium} />
        <View style={styles.customFolders}>
          {folders.map(folder => (
            <MailsFolderItem
              key={folder.id}
              icon="ui-folder"
              name={folder.name}
              selected={selectedFolder.id === folder.id}
              onPress={() => switchFolder({ id: folder.id, name: folder.name })}
              nbUnread={folder.nbUnread}
              depth={folder.depth}
            />
          ))}
        </View>
        <TertiaryButton
          style={styles.newFolderButton}
          iconLeft="ui-plus"
          text={I18n.get('mails-list-newfolder')}
          action={() => setIsInModalCreation(true)}
        />
      </View>
    );
  };

  const renderCreateNewFolder = () => {
    return (
      <View>
        <View style={styles.newFolderHeader}>
          <HeadingXSText>{I18n.get('mails-list-newfolder')}</HeadingXSText>
        </View>
        <InputContainer
          label={{ icon: 'ui-folder', indicator: LabelIndicator.REQUIRED, text: I18n.get('mails-list-newfolderlabel') }}
          input={<TextInput placeholder={I18n.get('mails-list-newfolderplaceholder')} maxLength={50} />}
        />
        <Separator marginVertical={UI_SIZES.spacing.medium} marginHorizontal={UI_SIZES.spacing.small} />
        <BodyText>{I18n.get('mails-list-newfoldersubtitle')}</BodyText>
      </View>
    );
  };

  const renderBottomSheetFolders = () => {
    return (
      <BottomSheetModal
        ref={bottomSheetModalRef}
        onDismiss={onDismissBottomSheet}
        snapPoints={['90%']}
        enableDynamicSizing={isInModalCreation ? false : true}>
        {isInModalCreation ? renderCreateNewFolder() : renderFolders()}
      </BottomSheetModal>
    );
  };

  const renderEmpty = () => {
    return (
      <EmptyScreen
        svgImage="empty-conversation"
        title={I18n.get('mails-list-emptytitle')}
        textColor={theme.palette.grey.black}
        text={I18n.get('mails-list-emptytext')}
      />
    );
  };

  const renderContent = () => (
    <PageView>
      <FlashList
        data={mails}
        renderItem={mail => {
          return (
            <MailsMailPreview data={mail.item} onPress={onPressItem} isSender={props.session?.user.id === mail.item.from.id} />
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
      renderLoading={() => <SmallBoldText>Loading</SmallBoldText>}
    />
  );
};

export default connect(() => ({
  session: getSession(),
}))(MailsListScreen);
