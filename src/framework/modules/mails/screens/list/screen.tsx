import * as React from 'react';
import { View } from 'react-native';

import type { NativeStackNavigationOptions, NativeStackScreenProps } from '@react-navigation/native-stack';
import { FlashList } from '@shopify/flash-list';
import { connect } from 'react-redux';

import styles from './styles';
import type { MailsListScreenPrivateProps } from './types';

import { I18n } from '~/app/i18n';
import TertiaryButton from '~/framework/components/buttons/tertiary';
import { UI_SIZES } from '~/framework/components/constants';
import InputContainer from '~/framework/components/inputs/container';
import { LabelIndicator } from '~/framework/components/inputs/container/label';
import TextInput from '~/framework/components/inputs/text';
import BottomSheetModal, { BottomSheetModalMethods } from '~/framework/components/modals/bottom-sheet';
import { NavBarAction } from '~/framework/components/navigation';
import { PageView } from '~/framework/components/page';
import Separator from '~/framework/components/separator';
import { BodyText, HeadingXSText } from '~/framework/components/text';
import { getSession } from '~/framework/modules/auth/reducer';
import MailsFolderItem from '~/framework/modules/mails/components/folder-item';
import MailsMailPreview from '~/framework/modules/mails/components/mail-preview';
import { mailsFoldersData, mailsListData } from '~/framework/modules/mails/data';
import { IMailsFolder, MailsDefaultFolders, MailsFolderInfo } from '~/framework/modules/mails/model';
import { MailsNavigationParams, mailsRouteNames } from '~/framework/modules/mails/navigation';
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
    if (folder.subfolders) {
      result.push(...flattenFolders(folder.subfolders));
    }
  });

  return result;
};

const MailsListScreen = (props: MailsListScreenPrivateProps) => {
  const bottomSheetModalRef = React.useRef<BottomSheetModalMethods>(null);
  const navigation = props.navigation;
  const [selectedFolder, setSelectedFolder] = React.useState<MailsDefaultFolders | MailsFolderInfo>(MailsDefaultFolders.INBOX);
  const [isInModalCreation, setIsInModalCreation] = React.useState<boolean>(false);

  const flattenedFolders = flattenFolders(mailsFoldersData);

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

  const switchFolder = (folder: MailsDefaultFolders | MailsFolderInfo) => {
    setSelectedFolder(folder);
    bottomSheetModalRef.current?.dismiss();
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
          {flattenedFolders.map(folder => (
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

  return (
    <PageView>
      <FlashList
        data={mailsListData}
        renderItem={mail => {
          return (
            <MailsMailPreview data={mail.item} onPress={onPressItem} isSender={props.session?.user.id === mail.item.from.id} />
          );
        }}
      />
      {renderBottomSheetFolders()}
    </PageView>
  );
};

export default connect(() => ({
  session: getSession(),
}))(MailsListScreen);
