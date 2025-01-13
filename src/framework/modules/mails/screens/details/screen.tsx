import * as React from 'react';
import { Alert, TouchableOpacity, View } from 'react-native';

import type { NativeStackNavigationOptions, NativeStackScreenProps } from '@react-navigation/native-stack';
import moment from 'moment';

import styles from './styles';
import type { MailsDetailsScreenPrivateProps } from './types';

import { HeaderBackButton } from '@react-navigation/elements';
import { I18n } from '~/app/i18n';
import theme from '~/app/theme';
import Attachments from '~/framework/components/attachments';
import SecondaryButton from '~/framework/components/buttons/secondary';
import { UI_SIZES } from '~/framework/components/constants';
import { EmptyConnectionScreen } from '~/framework/components/empty-screens';
import { RichEditorViewer } from '~/framework/components/inputs/rich-text';
import { deleteAction } from '~/framework/components/menus/actions';
import PopupMenu from '~/framework/components/menus/popup';
import BottomSheetModal, { BottomSheetModalMethods } from '~/framework/components/modals/bottom-sheet';
import { NavBarAction, NavBarActionsGroup } from '~/framework/components/navigation';
import { PageView } from '~/framework/components/page';
import { Svg } from '~/framework/components/picture';
import ScrollView from '~/framework/components/scrollView';
import Separator from '~/framework/components/separator';
import { HeadingXSText, SmallBoldText, SmallItalicText, SmallText } from '~/framework/components/text';
import Toast from '~/framework/components/toast';
import { ContentLoader } from '~/framework/hooks/loader';
import MailsPlaceholderDetails from '~/framework/modules/mails/components/placeholder/details';
import { MailsRecipientGroupItem, MailsRecipientUserItem } from '~/framework/modules/mails/components/recipient-item';
import { IMailsMailContent, MailsDefaultFolders, MailsRecipients } from '~/framework/modules/mails/model';
import { MailsNavigationParams, mailsRouteNames } from '~/framework/modules/mails/navigation';
import { mailsService } from '~/framework/modules/mails/service';
import { mailsFormatRecipients } from '~/framework/modules/mails/util';
import { userRouteNames } from '~/framework/modules/user/navigation';
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
  const bottomSheetModalRef = React.useRef<BottomSheetModalMethods>(null);
  const [mail, setMail] = React.useState<IMailsMailContent>();
  const [infosRecipients, setInfosRecipients] = React.useState<{ text: string; ids: string[] }>();

  const loadData = async () => {
    try {
      const mail = await mailsService.mail.get({ mailId: props.route.params.id });
      const infosRecipients = mailsFormatRecipients(mail.to, mail.cc, mail.cci);
      setInfosRecipients(infosRecipients);
      setMail(mail);
    } catch (e) {
      console.error('Failed to fetch mail content', e);
    }
  };

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

  const onTrash = async () => {
    try {
      await mailsService.mail.moveToTrash({ ids: [mail!.id] });
      props.navigation.navigate(mailsRouteNames.home, { from: props.route.params.from });
      Toast.showSuccess(I18n.get('mails-details-toastsuccesstrash'));
    } catch (e) {
      console.error(e);
    }
  };

  const onDelete = async () => {
    try {
      await mailsService.mail.delete({ ids: [mail!.id] });
      props.navigation.navigate(mailsRouteNames.home, { from: props.route.params.from });
      Toast.showSuccess(I18n.get('mails-details-toastsuccessdelete'));
    } catch (e) {
      console.error(e);
    }
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
    deleteAction({
      action: props.route.params.from === MailsDefaultFolders.TRASH ? onDelete : onTrash,
    }),
  ];

  const popupActionsMenu = () => {
    if (props.route.params.from === MailsDefaultFolders.OUTBOX) return allPopupActionsMenu.slice(-1);
    if (props.route.params.from === MailsDefaultFolders.TRASH) return allPopupActionsMenu.slice(-2);
    return [...allPopupActionsMenu.slice(0, 2), ...allPopupActionsMenu.slice(3)];
  };

  React.useEffect(() => {
    props.navigation.setOptions({
      headerLeft: () => (
        <HeaderBackButton
          labelVisible={false}
          tintColor={theme.palette.grey.white as string}
          onPress={() => props.navigation.navigate(mailsRouteNames.home, { from: props.route.params.from })}
        />
      ),
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
  }, [mail, props]);

  const renderRecipients = () => {
    return (
      <TouchableOpacity onPress={() => bottomSheetModalRef.current?.present()} style={styles.recipients}>
        <SmallText numberOfLines={1} style={styles.recipientsText}>
          {infosRecipients?.text}
        </SmallText>
        <Svg
          name="ui-rafterDown"
          fill={theme.palette.grey.graphite}
          height={UI_SIZES.elements.icon.xsmall}
          width={UI_SIZES.elements.icon.xsmall}
        />
      </TouchableOpacity>
    );
  };

  const renderButtons = () => {
    if (infosRecipients && infosRecipients.ids.length > 1)
      return (
        <>
          <SecondaryButton iconLeft="ui-undo" text={I18n.get('mails-details-reply')} action={() => Alert.alert('reply')} />
          <SecondaryButton iconLeft="ui-redo" text={I18n.get('mails-details-replyall')} action={() => Alert.alert('reply all')} />
          <SecondaryButton iconLeft="ui-options" action={() => Alert.alert('options')} round />
        </>
      );
    return (
      <>
        <SecondaryButton iconLeft="ui-undo" text={I18n.get('mails-details-forward')} action={() => Alert.alert('forward')} />
        <SecondaryButton iconLeft="ui-redo" text={I18n.get('mails-details-reply')} action={() => Alert.alert('reply')} />
      </>
    );
  };

  const hasRecipients = (recipients: MailsRecipients) => recipients.users.length > 0 || recipients.groups.length > 0;

  const renderListRecipients = (recipients: MailsRecipients, prefix: string) => {
    if (!hasRecipients(recipients)) return;
    return (
      <View>
        <SmallBoldText style={styles.bottomSheetPrefix}>{I18n.get(prefix)}</SmallBoldText>
        {recipients.users.length > 0 ? recipients.users.map(user => <MailsRecipientUserItem item={user} />) : null}
        {recipients.groups.length > 0 ? recipients.groups.map(group => <MailsRecipientGroupItem item={group} />) : null}
      </View>
    );
  };

  const renderBottomSheet = () => {
    return (
      <BottomSheetModal ref={bottomSheetModalRef}>
        {renderListRecipients(mail!.to, 'mails-prefixto')}
        {hasRecipients(mail!.to) && hasRecipients(mail!.cc) ? <Separator marginVertical={UI_SIZES.spacing.medium} /> : null}
        {renderListRecipients(mail!.cc, 'mails-prefixcc')}
        {hasRecipients(mail!.cc) && hasRecipients(mail!.cci) ? <Separator marginVertical={UI_SIZES.spacing.medium} /> : null}
        {renderListRecipients(mail!.cci, 'mails-prefixcci')}
      </BottomSheetModal>
    );
  };

  const renderContent = () => (
    <PageView>
      <ScrollView style={styles.page}>
        <HeadingXSText>{mail?.subject}</HeadingXSText>
        <View style={styles.topInfos}>
          <Avatar size={Size.large} sourceOrId={mail?.from.id} id="" />
          <View style={styles.topInfosText}>
            <View style={styles.sender}>
              <TouchableOpacity onPress={() => props.navigation.navigate(userRouteNames.profile, { userId: mail?.from.id })}>
                <SmallBoldText style={styles.senderName}>{mail?.from.displayName}</SmallBoldText>
              </TouchableOpacity>
              <SmallItalicText>{displayPastDate(moment(mail?.date))}</SmallItalicText>
            </View>
            {renderRecipients()}
          </View>
        </View>
        <RichEditorViewer content={mail?.body ?? ''} />
        {mail!.attachments.length > 0 ? <Attachments attachments={mail?.attachments} /> : null}
        <Separator marginVertical={UI_SIZES.spacing.big} />
        <View style={styles.buttons}>{renderButtons()}</View>
      </ScrollView>
      {renderBottomSheet()}
    </PageView>
  );

  return (
    <ContentLoader
      loadContent={loadData}
      renderContent={renderContent}
      renderError={() => <EmptyConnectionScreen />}
      renderLoading={() => <MailsPlaceholderDetails />}
    />
  );
}
