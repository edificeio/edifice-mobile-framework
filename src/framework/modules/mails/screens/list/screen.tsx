import * as React from 'react';

import type { NativeStackNavigationOptions, NativeStackScreenProps } from '@react-navigation/native-stack';
import { FlashList } from '@shopify/flash-list';

import styles from './styles';
import type { MailsListScreenPrivateProps } from './types';

import { I18n } from '~/app/i18n';
import TertiaryButton from '~/framework/components/buttons/tertiary';
import BottomSheetModal, { BottomSheetModalMethods } from '~/framework/components/modals/bottom-sheet';
import BottomSheetSeparator from '~/framework/components/modals/bottom-sheet/separator';
import { NavBarAction, NavBarActionsGroup } from '~/framework/components/navigation';
import { PageView } from '~/framework/components/page';
import MailsFolderItem from '~/framework/modules/mails/components/folder-item';
import MailsMailPreview from '~/framework/modules/mails/components/mail-preview';
import { mailsListData } from '~/framework/modules/mails/data';
import { MailsNavigationParams, mailsRouteNames } from '~/framework/modules/mails/navigation';
import { navBarOptions } from '~/framework/navigation/navBar';

export const computeNavBar = ({
  navigation,
  route,
}: NativeStackScreenProps<MailsNavigationParams, typeof mailsRouteNames.home>): NativeStackNavigationOptions => ({
  ...navBarOptions({
    navigation,
    route,
    title: I18n.get('mails-home-title'),
  }),
});

export default function MailsListScreen(props: MailsListScreenPrivateProps) {
  const bottomSheetModalRef = React.useRef<BottomSheetModalMethods>(null);
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
      headerRight: () => <NavBarActionsGroup elements={[<NavBarAction icon="ui-edit" />, <NavBarAction icon="ui-options" />]} />,
    });
  }, [props.navigation]);

  const renderBottomSheetFolders = () => {
    return (
      <BottomSheetModal ref={bottomSheetModalRef}>
        <MailsFolderItem icon="ui-inbox" name="Boîte de reception" selected />
        <MailsFolderItem icon="ui-send" name="Messages envoyés" selected={false} />
        <MailsFolderItem icon="ui-edit" name="Brouillons" selected={false} />
        <MailsFolderItem icon="ui-delete" name="Corbeille" selected={false} />
        <BottomSheetSeparator />
        <TertiaryButton style={styles.newFolderButton} iconLeft="ui-plus" text="Nouveau dossier" />
      </BottomSheetModal>
    );
  };

  return (
    <PageView>
      <FlashList
        data={mailsListData}
        renderItem={mail => {
          return <MailsMailPreview data={mail.item} />;
        }}
      />
      {renderBottomSheetFolders()}
    </PageView>
  );
}
