import * as React from 'react';
import { TouchableOpacity, View } from 'react-native';

import { HeaderBackButton } from '@react-navigation/elements';
import type { NativeStackNavigationOptions, NativeStackScreenProps } from '@react-navigation/native-stack';
import moment from 'moment';
import { connect } from 'react-redux';

import styles from './styles';
import type { MailsDetailsScreenPrivateProps } from './types';

import { I18n } from '~/app/i18n';
import theme from '~/app/theme';
import Attachments from '~/framework/components/attachments';
import DefaultButton from '~/framework/components/buttons/default';
import SecondaryButton from '~/framework/components/buttons/secondary';
import TertiaryButton from '~/framework/components/buttons/tertiary';
import { UI_SIZES } from '~/framework/components/constants';
import { EmptyConnectionScreen, EmptyContentScreen } from '~/framework/components/empty-screens';
import { RichEditorViewer } from '~/framework/components/inputs/rich-text';
import { deleteAction } from '~/framework/components/menus/actions';
import PopupMenu from '~/framework/components/menus/popup';
import BottomSheetModal, { BottomSheetModalMethods } from '~/framework/components/modals/bottom-sheet';
import { NavBarAction, NavBarActionsGroup } from '~/framework/components/navigation';
import { AvatarSize, NewAvatar } from '~/framework/components/newavatar';
import { PageView } from '~/framework/components/page';
import { Svg } from '~/framework/components/picture';
import ScrollView from '~/framework/components/scrollView';
import Separator from '~/framework/components/separator';
import { HeadingXSText, SmallBoldText, SmallItalicText, SmallText } from '~/framework/components/text';
import { default as Toast, default as toast } from '~/framework/components/toast';
import { ContentLoader } from '~/framework/hooks/loader';
import { getSession } from '~/framework/modules/auth/reducer';
import MailsFoldersBottomSheet from '~/framework/modules/mails/components/folders-bottom-sheet';
import MailsInputBottomSheet from '~/framework/modules/mails/components/input-bottom-sheet';
import MailsPlaceholderDetails from '~/framework/modules/mails/components/placeholder/details';
import { MailsRecipientGroupItem, MailsRecipientUserItem } from '~/framework/modules/mails/components/recipient-item';
import {
  IMailsMailContent,
  MailsDefaultFolders,
  MailsFolderInfo,
  MailsListTypeModal,
  MailsRecipients,
  MailsVisible,
} from '~/framework/modules/mails/model';
import { MailsNavigationParams, mailsRouteNames } from '~/framework/modules/mails/navigation';
import { MailsEditType } from '~/framework/modules/mails/screens/edit';
import { mailsService } from '~/framework/modules/mails/service';
import {
  convertAttachmentToDistantFile,
  convertRecipientGroupInfoToVisible,
  convertRecipientUserInfoToVisible,
  mailsFormatRecipients,
  separateContentAndHistory,
} from '~/framework/modules/mails/util';
import { userRouteNames } from '~/framework/modules/user/navigation';
import { navBarOptions } from '~/framework/navigation/navBar';
import { displayPastDate } from '~/framework/util/date';

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

const MailsDetailsScreen = (props: MailsDetailsScreenPrivateProps) => {
  const { folders, from, id } = props.route.params;
  const bottomSheetModalRef = React.useRef<BottomSheetModalMethods>(null);
  const [mail, setMail] = React.useState<IMailsMailContent>();
  const [mailContent, setMailContent] = React.useState<string>('');
  const [mailHistory, setMailHistory] = React.useState<string>('');
  const [newParentFolder, setNewParentFolder] = React.useState<MailsFolderInfo>();
  const [infosRecipients, setInfosRecipients] = React.useState<{ text: string; ids: string[] }>();
  const [valueNewFolder, setValueNewFolder] = React.useState<string>('');
  const [seeHistory, setSeeHistory] = React.useState<boolean>(false);
  const [error, setError] = React.useState<boolean>(false);
  const [typeModal, setTypeModal] = React.useState<MailsListTypeModal | undefined>(undefined);

  const convertedAttachments = React.useMemo(
    () => mail?.attachments.map(attachment => convertAttachmentToDistantFile(attachment, id)),
    [mail, id],
  );

  const loadData = async () => {
    try {
      const mailData = await mailsService.mail.get({ id });
      const _infosRecipients = mailsFormatRecipients(mailData.to, mailData.cc, mailData.cci);
      const { content, history } = separateContentAndHistory(mailData.body);
      setInfosRecipients(_infosRecipients);
      setMail(mailData);
      setMailContent(content);
      setMailHistory(history);
    } catch (e) {
      console.error('Failed to fetch mail content', e);
      setError(true);
    }
  };

  const onDismissBottomSheet = React.useCallback(() => {
    if (typeModal) setTypeModal(undefined);
  }, [typeModal]);

  const onReply = React.useCallback(() => {
    let to: MailsVisible[] = [];
    if (mail?.from.id !== props.session?.user.id) to.push(convertRecipientUserInfoToVisible(mail!.from));
    else {
      let users = mail!.to.users.map(user => convertRecipientUserInfoToVisible(user));
      let groups = mail!.to.groups.map(group => convertRecipientGroupInfoToVisible(group));
      to = [...users, ...groups];
    }
    props.navigation.navigate(mailsRouteNames.edit, {
      fromFolder: from,
      initialMailInfo: { id: mail!.id, subject: mail?.subject, to },
      type: MailsEditType.REPLY,
    });
  }, [from, mail, props]);

  const onReplyAll = React.useCallback(() => {
    let to: MailsVisible[] = [];
    if (mail?.from.id !== props.session?.user.id) {
      to.push(convertRecipientUserInfoToVisible(mail!.from));
      if (mail!.to.groups.length > 0 || mail!.to.users.length > 0) {
        let users = mail!.to.users
          .filter(user => user.id !== props.session?.user.id)
          .map(user => convertRecipientUserInfoToVisible(user));
        let groups = mail!.to.groups.map(group => convertRecipientGroupInfoToVisible(group));
        to = [...to, ...users, ...groups];
      }
    } else {
      let users = mail!.to.users.map(user => convertRecipientUserInfoToVisible(user));
      let groups = mail!.to.groups.map(group => convertRecipientGroupInfoToVisible(group));
      to = [...users, ...groups];
    }

    let cc: MailsVisible[] = [
      ...mail!.cc.users.filter(user => user.id !== props.session?.user.id).map(user => convertRecipientUserInfoToVisible(user)),
      ...mail!.cc.groups.map(group => convertRecipientGroupInfoToVisible(group)),
    ];

    let cci: MailsVisible[] = [
      ...mail!.cci.users.filter(user => user.id !== props.session?.user.id).map(user => convertRecipientUserInfoToVisible(user)),
      ...mail!.cci.groups.map(group => convertRecipientGroupInfoToVisible(group)),
    ];

    props.navigation.navigate(mailsRouteNames.edit, {
      fromFolder: from,
      initialMailInfo: { cc, cci, id: mail!.id, subject: mail?.subject, to },
      type: MailsEditType.REPLY,
    });
  }, [from, mail, props]);

  const onForward = React.useCallback(() => {
    let users = mail!.to.users.map(user => convertRecipientUserInfoToVisible(user));
    let groups = mail!.to.groups.map(group => convertRecipientGroupInfoToVisible(group));
    const to: MailsVisible[] = [...users, ...groups];

    props.navigation.navigate(mailsRouteNames.edit, {
      fromFolder: from,
      initialMailInfo: { body: mail?.body, from: mail?.from, id: mail!.id, subject: mail?.subject, to },
      type: MailsEditType.FORWARD,
    });
  }, [from, mail, props]);

  const onCreateNewFolder = React.useCallback(async () => {
    try {
      const folderId = await mailsService.folder.create({ name: valueNewFolder });
      await mailsService.mail.moveToFolder({ folderId: folderId }, { ids: [id] });
      props.navigation.navigate(mailsRouteNames.home, { from: { id: folderId, name: valueNewFolder }, reload: true });
      Toast.showSuccess(I18n.get('mails-details-toastsuccessmove'));
    } catch (e) {
      console.error(e);
    }
  }, [id, props.navigation, valueNewFolder]);

  const handleMailAction = React.useCallback(
    async (action: () => Promise<void>, successMessageKey: string) => {
      try {
        await action();
        Toast.showSuccess(I18n.get(successMessageKey));
        const navigationParams = {
          from,
          ...(successMessageKey === 'mails-details-toastsuccessunread' ? { idMailToMarkUnread: id } : { idMailToRemove: id }),
        };
        props.navigation.navigate(mailsRouteNames.home, navigationParams);
      } catch (e) {
        console.error(e);
        toast.showError();
      }
    },
    [from, id, props.navigation],
  );

  const onMarkUnread = () =>
    handleMailAction(() => mailsService.mail.toggleUnread({ ids: [id], unread: true }), 'mails-details-toastsuccessunread');

  const onOpenMoveModal = () => {
    setTypeModal(MailsListTypeModal.MOVE);
    bottomSheetModalRef.current?.present();
  };

  const onMove = React.useCallback(
    () =>
      handleMailAction(
        () => mailsService.mail.moveToFolder({ folderId: newParentFolder!.id }, { ids: [id] }),
        'mails-details-toastsuccessmove',
      ),
    [handleMailAction, id, newParentFolder],
  );

  const onRemoveFromFolder = () =>
    handleMailAction(() => mailsService.mail.removeFromFolder({ ids: [id] }), 'mails-details-toastsuccessremovefromfolder');

  const onRestore = () => handleMailAction(() => mailsService.mail.restore({ ids: [id] }), 'mails-details-toastsuccessrestore');

  const onTrash = () => handleMailAction(() => mailsService.mail.moveToTrash({ ids: [id] }), 'mails-details-toastsuccesstrash');

  const onDelete = () => handleMailAction(() => mailsService.mail.delete({ ids: [id] }), 'mails-details-toastsuccessdelete');

  const allPopupActionsMenu = [
    {
      action: onReply,
      icon: {
        android: 'ic_reply',
        ios: 'arrowshape.turn.up.left',
      },
      title: I18n.get('mails-details-reply'),
    },
    {
      action: onReplyAll,
      icon: {
        android: 'ic_reply',
        ios: 'arrowshape.turn.up.left.2',
      },
      title: I18n.get('mails-details-replyall'),
    },
    {
      action: onForward,
      icon: {
        android: 'ic_forward',
        ios: 'arrowshape.turn.up.forward',
      },
      title: I18n.get('mails-details-forward'),
    },
    {
      action: onMarkUnread,
      icon: {
        android: 'ic_visibility_off',
        ios: 'envelope.badge',
      },
      title: I18n.get('mails-details-markunread'),
    },
    {
      action: onOpenMoveModal,
      icon: {
        android: 'ic_move_to_inbox',
        ios: 'tray.2',
      },
      title: I18n.get('mails-details-move'),
    },
    {
      action: onRemoveFromFolder,
      icon: {
        android: 'ic_remove_from_folder',
        ios: 'xmark.bin',
      },
      title: I18n.get('mails-details-removefromfolder'),
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
      action: from === MailsDefaultFolders.TRASH ? onDelete : onTrash,
    }),
  ];

  const popupActionsMenu = allPopupActionsMenu.filter(action => {
    const { from } = props.route.params;

    switch (action.action) {
      case onReply:
      case onForward:
        return from !== MailsDefaultFolders.TRASH;

      case onReplyAll:
        return infosRecipients && infosRecipients.ids.length > 1 && from !== MailsDefaultFolders.TRASH;

      case onMarkUnread:
      case onOpenMoveModal:
        return from !== MailsDefaultFolders.TRASH;
      case onRemoveFromFolder:
        return from !== MailsDefaultFolders.TRASH && from !== MailsDefaultFolders.INBOX && from !== MailsDefaultFolders.OUTBOX;

      case onRestore:
        return from === MailsDefaultFolders.TRASH;

      case onDelete:
      case onTrash:
        return true;

      default:
        return false;
    }
  });

  React.useEffect(() => {
    props.navigation.setOptions({
      headerLeft: () => (
        <HeaderBackButton
          labelVisible={false}
          tintColor={theme.palette.grey.white as string}
          onPress={() => props.navigation.navigate(mailsRouteNames.home, { from })}
        />
      ),
      headerRight: () =>
        mail?.trashed ? (
          <PopupMenu actions={popupActionsMenu}>
            <NavBarAction icon="ui-options" />
          </PopupMenu>
        ) : (
          <NavBarActionsGroup
            elements={[
              <NavBarAction icon="ui-undo" onPress={onReply} />,
              <PopupMenu actions={popupActionsMenu}>
                <NavBarAction icon="ui-options" />
              </PopupMenu>,
            ]}
          />
        ),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mail, newParentFolder, props]);

  const renderRecipients = React.useCallback(() => {
    return (
      <TouchableOpacity
        onPress={() => bottomSheetModalRef.current?.present()}
        style={styles.recipients}
        disabled={infosRecipients?.ids.length === 0}>
        <SmallText numberOfLines={1} style={styles.recipientsText}>
          {infosRecipients?.text}
        </SmallText>
        {infosRecipients?.ids.length ? (
          <Svg
            name="ui-rafterDown"
            fill={theme.palette.grey.graphite}
            height={UI_SIZES.elements.icon.xsmall}
            width={UI_SIZES.elements.icon.xsmall}
          />
        ) : null}
      </TouchableOpacity>
    );
  }, [infosRecipients]);

  const renderAttachments = React.useCallback(() => {
    if (mail!.attachments.length <= 0) return;
    return <Attachments session={props.session!} attachments={convertedAttachments} />;
  }, [convertedAttachments, mail, props.session]);

  const renderOriginalContent = React.useCallback(() => {
    const navigateToOriginalContent = () => {
      props.navigation.navigate(mailsRouteNames.originalContent, { id });
    };

    if (!mail?.original_format_exists) return;
    return <TertiaryButton text="Voir le contenu en version original" action={navigateToOriginalContent} />;
  }, [id, mail?.original_format_exists, props.navigation]);

  const renderHistory = React.useCallback(() => {
    if (!mailHistory) return <Separator marginVertical={UI_SIZES.spacing.big} />;
    return (
      <View style={{ marginVertical: UI_SIZES.spacing.big }}>
        <DefaultButton
          text="Afficher l'historique"
          iconRight={seeHistory ? 'ui-rafterUp' : 'ui-rafterDown'}
          contentColor={theme.palette.grey.black}
          style={styles.buttonHistory}
          action={() => setSeeHistory(!seeHistory)}
        />
        {seeHistory ? <RichEditorViewer content={mailHistory} /> : null}
        <Separator />
      </View>
    );
  }, [seeHistory, mailHistory]);

  const renderButtons = React.useCallback(() => {
    if (mail?.trashed) return null;
    return (
      <View style={styles.buttons}>
        <SecondaryButton iconLeft="ui-undo" text={I18n.get('mails-details-reply')} action={onReply} />
        {infosRecipients && infosRecipients.ids.length > 1 ? (
          <SecondaryButton iconLeft="ui-answerall" text={I18n.get('mails-details-replyall')} action={onReplyAll} />
        ) : (
          <SecondaryButton iconLeft="ui-redo" text={I18n.get('mails-details-forward')} action={onForward} />
        )}
      </View>
    );
  }, [infosRecipients, mail, onForward, onReply, onReplyAll]);

  const hasRecipients = (recipients: MailsRecipients) => recipients.users.length > 0 || recipients.groups.length > 0;

  const renderListRecipients = React.useCallback((recipients: MailsRecipients, prefix: string) => {
    if (!hasRecipients(recipients)) return;
    return (
      <View>
        <SmallBoldText style={styles.bottomSheetPrefix}>{I18n.get(prefix)}</SmallBoldText>
        {recipients.users.length > 0 ? recipients.users.map(user => <MailsRecipientUserItem key={user.id} item={user} />) : null}
        {recipients.groups.length > 0
          ? recipients.groups.map(group => <MailsRecipientGroupItem key={group.id} item={group} />)
          : null}
      </View>
    );
  }, []);

  const renderDetailsRecipients = React.useCallback(
    () => (
      <View style={styles.contentBottomSheet}>
        {renderListRecipients(mail!.to, 'mails-prefixto')}
        {hasRecipients(mail!.to) && hasRecipients(mail!.cc) ? <Separator marginVertical={UI_SIZES.spacing.medium} /> : null}
        {renderListRecipients(mail!.cc, 'mails-prefixcc')}
        {hasRecipients(mail!.cc) && hasRecipients(mail!.cci) ? <Separator marginVertical={UI_SIZES.spacing.medium} /> : null}
        {renderListRecipients(mail!.cci, 'mails-prefixcci')}
      </View>
    ),
    [mail, renderListRecipients],
  );

  const renderCreateFolder = React.useCallback(
    () => (
      <MailsInputBottomSheet
        title={I18n.get('mails-list-newfolder')}
        action={onCreateNewFolder}
        inputLabel={I18n.get('mails-list-newfolderlabel')}
        inputPlaceholder={I18n.get('mails-list-newfolderplaceholder')}
        setInputValue={text => setValueNewFolder(text)}
        inputValue={valueNewFolder}
        disabledAction={valueNewFolder.length === 0}
      />
    ),
    [onCreateNewFolder, valueNewFolder],
  );

  const renderMoveFolder = React.useCallback(
    () => (
      <MailsFoldersBottomSheet
        title={I18n.get('mails-details-move')}
        action={onMove}
        disabledAction={!newParentFolder}
        folders={folders}
        mailFolderId={mail!.folder_id}
        newParentFolderId={newParentFolder?.id}
        onPressCreateFolderButton={() => setTypeModal(MailsListTypeModal.CREATE)}
        onPressFolder={setNewParentFolder}
      />
    ),
    [folders, mail, newParentFolder, onMove],
  );

  const renderContentBottomSheet = React.useCallback(() => {
    switch (typeModal) {
      case MailsListTypeModal.CREATE:
        return renderCreateFolder();
      case MailsListTypeModal.MOVE:
        return renderMoveFolder();
      default:
        return renderDetailsRecipients();
    }
  }, [typeModal, renderCreateFolder, renderMoveFolder, renderDetailsRecipients]);

  const renderBottomSheet = React.useCallback(() => {
    return (
      <BottomSheetModal
        ref={bottomSheetModalRef}
        onDismiss={onDismissBottomSheet}
        snapPoints={['90%']}
        enableDynamicSizing={typeModal ? false : true}
        containerStyle={styles.bottomSheet}>
        {renderContentBottomSheet()}
      </BottomSheetModal>
    );
  }, [onDismissBottomSheet, renderContentBottomSheet, typeModal]);

  const renderContent = React.useCallback(() => {
    if (error) return <EmptyContentScreen />;
    return (
      <PageView>
        <ScrollView style={styles.page}>
          <HeadingXSText>{mail?.subject && mail?.subject.length ? mail.subject : I18n.get('mails-list-noobject')}</HeadingXSText>
          <View style={styles.topInfos}>
            <NewAvatar size={AvatarSize.lg} userId={mail?.from.id} />
            <View style={styles.topInfosText}>
              <View style={styles.sender}>
                <TouchableOpacity
                  style={styles.touchableSender}
                  onPress={() => props.navigation.navigate(userRouteNames.profile, { userId: mail?.from.id })}>
                  <SmallBoldText style={styles.senderName} numberOfLines={1} ellipsizeMode="tail">
                    {mail?.from.displayName}
                  </SmallBoldText>
                </TouchableOpacity>
                <SmallItalicText>{displayPastDate(moment(mail?.date))}</SmallItalicText>
              </View>
              {renderRecipients()}
            </View>
          </View>
          <RichEditorViewer content={mailContent} />
          {renderAttachments()}
          {renderOriginalContent()}
          {renderHistory()}
          {renderButtons()}
        </ScrollView>
        {renderBottomSheet()}
      </PageView>
    );
  }, [
    error,
    mail?.date,
    mail?.from.displayName,
    mail?.from.id,
    mail?.subject,
    mailContent,
    props.navigation,
    renderAttachments,
    renderBottomSheet,
    renderButtons,
    renderHistory,
    renderOriginalContent,
    renderRecipients,
  ]);

  return (
    <ContentLoader
      loadContent={loadData}
      renderContent={renderContent}
      renderError={() => <EmptyConnectionScreen />}
      renderLoading={() => <MailsPlaceholderDetails />}
    />
  );
};

export default connect(() => ({
  session: getSession(),
}))(MailsDetailsScreen);
