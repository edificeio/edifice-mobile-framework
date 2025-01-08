import * as React from 'react';
import { Alert, View } from 'react-native';

import type { NativeStackNavigationOptions, NativeStackScreenProps } from '@react-navigation/native-stack';
import moment from 'moment';

import styles from './styles';
import type { MailsDetailsScreenPrivateProps } from './types';

import { I18n } from '~/app/i18n';
import Attachments from '~/framework/components/attachments';
import SecondaryButton from '~/framework/components/buttons/secondary';
import { UI_SIZES } from '~/framework/components/constants';
import { RichEditorViewer } from '~/framework/components/inputs/rich-text';
import { deleteAction } from '~/framework/components/menus/actions';
import PopupMenu from '~/framework/components/menus/popup';
import { NavBarAction, NavBarActionsGroup } from '~/framework/components/navigation';
import { PageView } from '~/framework/components/page';
import ScrollView from '~/framework/components/scrollView';
import Separator from '~/framework/components/separator';
import { HeadingXSText, SmallBoldText, SmallItalicText, SmallText } from '~/framework/components/text';
import Toast from '~/framework/components/toast';
import { mailsDetailsData } from '~/framework/modules/mails/data';
import { MailsDefaultFolders, MailsRecipientsType } from '~/framework/modules/mails/model';
import { MailsNavigationParams, mailsRouteNames } from '~/framework/modules/mails/navigation';
import { MailsRecipientPrefixsI18n } from '~/framework/modules/mails/util';
import { navBarOptions } from '~/framework/navigation/navBar';
import { displayPastDate } from '~/framework/util/date';
import Avatar, { Size } from '~/ui/avatars/Avatar';

export const computeNavBar = ({
  navigation,
  route,
}: NativeStackScreenProps<MailsNavigationParams, typeof mailsRouteNames.details>): NativeStackNavigationOptions => ({
  ...navBarOptions({
    navigation,
    route,
    title: '',
  }),
});

export default function MailsDetailsScreen(props: MailsDetailsScreenPrivateProps) {
  const onMarkUnread = () => {
    props.navigation.goBack();
    Alert.alert('mark unread');
    Toast.showSuccess(I18n.get('mails-details-toastsuccessunread'));
  };

  const onMove = () => {
    Alert.alert('move');
  };

  const onRestore = () => {
    Alert.alert('restore');
  };

  const onDelete = () => {
    props.navigation.goBack();
    Alert.alert('delete');
    Toast.showSuccess(I18n.get('mails-details-toastsuccessdelete'));
  };

  const allPopupActionsMenu = [
    {
      action: onMarkUnread,
      icon: {
        android: 'ic_visibility_off',
        ios: 'eye.slash',
      },
      title: I18n.get('mails-details-markunread'),
    },
    {
      action: onMove,
      icon: {
        android: 'ic_move_to_inbox',
        ios: 'arrow.up.square',
      },
      title: I18n.get('mails-details-move'),
    },
    {
      action: onRestore,
      icon: {
        android: 'ic_restore',
        ios: 'arrow.uturn.backward.circle',
      },
      title: I18n.get('mails-details-restore'),
    },
    deleteAction({ action: onDelete }),
  ];

  const popupActionsMenu = () => {
    if (props.route.params.from === MailsDefaultFolders.OUTBOX) return allPopupActionsMenu.slice(-1);
    if (props.route.params.from === MailsDefaultFolders.TRASH) return allPopupActionsMenu.slice(-2);
    return [...allPopupActionsMenu.slice(0, 2), ...allPopupActionsMenu.slice(3)];
  };

  React.useEffect(() => {
    props.navigation.setOptions({
      headerRight: () => (
        <NavBarActionsGroup
          elements={[
            <NavBarAction icon="ui-undo" onPress={() => Alert.alert('reply')} />,
            <PopupMenu actions={popupActionsMenu()}>
              <NavBarAction icon="ui-options" />
            </PopupMenu>,
          ]}
        />
      ),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const renderRecipients = () => {
    return Object.keys(MailsRecipientsType).map(recipientTypeKey => {
      const recipientType = MailsRecipientsType[recipientTypeKey];
      if (mailsDetailsData[recipientType].length === 0) return;
      return (
        <View style={styles.recipientsItem}>
          <SmallText>{I18n.get(MailsRecipientPrefixsI18n[recipientType].name)}</SmallText>
          <SmallText style={styles.recipientsText}>
            {mailsDetailsData[recipientType].map(recipient => recipient.displayName).join(', ')}
          </SmallText>
        </View>
      );
    });
  };

  return (
    <PageView>
      <ScrollView style={styles.page}>
        <HeadingXSText>{mailsDetailsData.subject}</HeadingXSText>
        <View style={styles.topInfos}>
          <Avatar size={Size.large} sourceOrId={mailsDetailsData.from.id} id="" />
          <View style={styles.topInfosText}>
            <View style={styles.sender}>
              <SmallBoldText style={styles.senderName}>{mailsDetailsData.from.displayName}</SmallBoldText>
              <SmallItalicText>{displayPastDate(moment(mailsDetailsData.date))}</SmallItalicText>
            </View>
            {renderRecipients()}
          </View>
        </View>
        <RichEditorViewer content={mailsDetailsData.body} />
        <Attachments
          attachments={[
            { name: 'cc.png', uri: '' },
            { name: 'dbzhdbezhdbezddferfderfrefrezd.png', uri: '' },
            { name: 'a', uri: '' },
            { name: 'b', uri: '' },
            { name: 'c', uri: '' },
            { name: 'a', uri: '' },
            { name: 'b', uri: '' },
            { name: 'c', uri: '' },
          ]}
        />
        <Separator marginVertical={UI_SIZES.spacing.big} />
        <View style={styles.buttons}>
          <SecondaryButton iconLeft="ui-undo" text={I18n.get('mails-details-forward')} action={() => Alert.alert('forward')} />
          <SecondaryButton iconLeft="ui-redo" text={I18n.get('mails-details-reply')} action={() => Alert.alert('reply')} />
        </View>
      </ScrollView>
    </PageView>
  );
}