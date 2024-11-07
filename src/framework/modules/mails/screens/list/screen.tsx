import * as React from 'react';
import { View } from 'react-native';

import type { NativeStackNavigationOptions, NativeStackScreenProps } from '@react-navigation/native-stack';
import { FlashList } from '@shopify/flash-list';

import styles from './styles';
import type { MailsListScreenPrivateProps } from './types';

import { I18n } from '~/app/i18n';
import TertiaryButton from '~/framework/components/buttons/tertiary';
import { UI_SIZES } from '~/framework/components/constants';
import BottomSheetModal, { BottomSheetModalMethods } from '~/framework/components/modals/bottom-sheet';
import { NavBarAction } from '~/framework/components/navigation';
import { PageView } from '~/framework/components/page';
import Separator from '~/framework/components/separator';
import MailsFolderItem from '~/framework/modules/mails/components/folder-item';
import MailsMailPreview from '~/framework/modules/mails/components/mail-preview';
import { mailsListData } from '~/framework/modules/mails/data';
import { MailsDefaultFolders } from '~/framework/modules/mails/model';
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
    icon: 'ui-inbox',
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

export default function MailsListScreen(props: MailsListScreenPrivateProps) {
  const bottomSheetModalRef = React.useRef<BottomSheetModalMethods>(null);
  const navigation = props.navigation;
  const [selectedFolder, setSelectedFolder] = React.useState<MailsDefaultFolders | string>(MailsDefaultFolders.INBOX);

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
      headerTitle: navBarTitle(I18n.get(defaultFoldersInfos[selectedFolder].title)),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedFolder]);

  const switchFolder = (folder: MailsDefaultFolders | string) => {
    setSelectedFolder(folder);
    bottomSheetModalRef.current?.dismiss();
  };

  const onPressItem = () => {
    navigation.navigate(mailsRouteNames.details, { from: MailsDefaultFolders.INBOX });
  };

  const renderBottomSheetFolders = () => {
    return (
      <BottomSheetModal ref={bottomSheetModalRef}>
        <View style={styles.defaultFolders}>
          {Object.keys(defaultFoldersInfos).map(folder => (
            <MailsFolderItem
              key={folder}
              icon={defaultFoldersInfos[folder].icon}
              name={I18n.get(defaultFoldersInfos[folder].title)}
              selected={selectedFolder === folder}
              onPress={() => switchFolder(folder)}
            />
          ))}
        </View>
        <Separator marginHorizontal={UI_SIZES.spacing.small} marginVertical={UI_SIZES.spacing.medium} />
        <TertiaryButton
          style={styles.newFolderButton}
          iconLeft="ui-plus"
          text={I18n.get('mails-list-newfolder')}
          action={() => console.log('create folder')}
        />
      </BottomSheetModal>
    );
  };

  return (
    <PageView>
      <FlashList
        data={mailsListData}
        renderItem={mail => {
          return <MailsMailPreview data={mail.item} onPress={onPressItem} />;
        }}
      />
      {renderBottomSheetFolders()}
    </PageView>
  );
}
