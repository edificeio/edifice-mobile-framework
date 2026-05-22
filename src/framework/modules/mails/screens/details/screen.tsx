import * as React from 'react';
import { Alert, TouchableOpacity, View } from 'react-native';

import { HeaderBackButton } from '@react-navigation/elements';
import type { NativeStackNavigationOptions, NativeStackScreenProps } from '@react-navigation/native-stack';
import moment from 'moment';
import { ScrollView as GHScrollView } from 'react-native-gesture-handler';
import { connect } from 'react-redux';

import { I18n } from '~/app/i18n';
import theme from '~/app/theme';
import AlertCard from '~/framework/components/alert';
import { SingleAvatar } from '~/framework/components/avatar';
import SecondaryButton from '~/framework/components/buttons/secondary';
import TertiaryButton from '~/framework/components/buttons/tertiary';
import { UI_SIZES } from '~/framework/components/constants';
import { EmptyConnectionScreen, EmptyContentScreen, EmptyScreen } from '~/framework/components/empty-screens';
import { RichEditorViewer } from '~/framework/components/inputs/rich-text';
import PopupMenu from '~/framework/components/menus/popup';
import BottomSheetModal, { BottomSheetModalMethods } from '~/framework/components/modals/bottom-sheet';
import { NavBarAction, NavBarActionsGroup } from '~/framework/components/navigation';
import { PageView } from '~/framework/components/page';
import { Svg } from '~/framework/components/picture';
import ScrollView from '~/framework/components/scrollView';
import Separator from '~/framework/components/separator';
import { BodyText, HeadingXSText, NestedActionText, SmallBoldText, SmallItalicText, SmallText } from '~/framework/components/text';
import { default as Toast, default as toast } from '~/framework/components/toast';
import { ContentLoader } from '~/framework/hooks/loader';
import { AccountType } from '~/framework/modules/auth/model';
import { getSession } from '~/framework/modules/auth/redux/reducer';
import Attachments from '~/framework/modules/mails/components/attachments';
import MailsHistoryButton from '~/framework/modules/mails/components/history-button';
import MailsInputBottomSheet from '~/framework/modules/mails/components/input-bottom-sheet';
import MailsMoveBottomSheet from '~/framework/modules/mails/components/move-bottom-sheet';
import MailsPlaceholderDetails from '~/framework/modules/mails/components/placeholder/details';
import { MailsRecipientGroupItem, MailsRecipientUserItem } from '~/framework/modules/mails/components/recipient-item';
import {
  IMailsMailContent,
  MailsDefaultFolders,
  MailsListTypeModal,
  MailsMailStatePreview,
  MailsRecipientGroupInfo,
  MailsRecipients,
  MailsVisible,
} from '~/framework/modules/mails/model';
import { MailsNavigationParams, mailsRouteNames } from '~/framework/modules/mails/navigation';
import { getMailCarbonioRight, getRecallMessageRight } from '~/framework/modules/mails/rights';
import { MailsEditType } from '~/framework/modules/mails/screens/edit';
import { mailsService } from '~/framework/modules/mails/service';
import { defaultUserIdCarbonio } from '~/framework/modules/mails/service/api/carbonio';
import {
  convertAttachmentToDistantFile,
  convertRecipientGroupInfoToVisible,
  convertRecipientUserInfoToVisible,
  isServiceMethodAvailable,
  mailsFormatRecipients,
  renderSubject,
  separateContentAndHistory,
} from '~/framework/modules/mails/util';
import { userRouteNames } from '~/framework/modules/user/navigation';
import { navBarOptions } from '~/framework/navigation/navBar';
import { displayPastDate } from '~/framework/util/date';
import { openUrl } from '~/framework/util/linking';

import styles from './styles';
import type { MailsDetailsScreenPrivateProps } from './types';

const isDateOlderThan60Minutes = (date: moment.Moment) => {
  const now = moment();
  const diff = now.diff(date, 'minutes');
  return diff > 60;
};

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
  const { folders, fromFolder, fromTimeline, id } = props.route.params;
  const bottomSheetModalRef = React.useRef<BottomSheetModalMethods>(null);
  const [mail, setMail] = React.useState<IMailsMailContent>();
  const [mailContent, setMailContent] = React.useState<string>('');
  const [mailHistory, setMailHistory] = React.useState<string>('');
  const [infosRecipients, setInfosRecipients] = React.useState<{ text: string; ids: string[] }>();
  const [error, setError] = React.useState<boolean>(false);
  const [typeModal, setTypeModal] = React.useState<MailsListTypeModal | undefined>(undefined);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);

  const currentUserId =
    props.session && getMailCarbonioRight(props.session) ? defaultUserIdCarbonio(props.session) : props.session?.user.id;

  const canRecall =
    currentUserId === mail?.from.id && !isDateOlderThan60Minutes(moment(mail?.date)) && getRecallMessageRight(props.session!);
  const isRecall = mail?.state === MailsMailStatePreview.RECALL;
  const isRecallAndNotSender = mail?.state === MailsMailStatePreview.RECALL && mail?.from.id !== currentUserId;
  const isContentEmpty = React.useMemo(() => mailContent === '' || mailContent === '<p></p>', [mailContent]);

  const convertedAttachments = React.useMemo(
    () => mail?.attachments.map(attachment => convertAttachmentToDistantFile(attachment, id)),
    [mail, id],
  );

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(false);
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
    } finally {
      setIsLoading(false);
    }
  };

  const onDismissBottomSheet = React.useCallback(() => {
    if (typeModal) setTypeModal(undefined);
  }, [typeModal]);

  const onReply = React.useCallback(() => {
    let to: MailsVisible[] = [];
    if (mail?.from.id !== currentUserId) to.push(convertRecipientUserInfoToVisible(mail!.from));
    else {
      let users = mail!.to.users.map(user => convertRecipientUserInfoToVisible(user));
      let groups = mail!.to.groups.map(group => convertRecipientGroupInfoToVisible(group));
      to = [...users, ...groups];
    }
    props.navigation.navigate(
      mailsRouteNames.edit,
      {
        fromFolder,
        initialMailInfo: { body: mail?.body, date: mail?.date, from: mail?.from, id: mail!.id, subject: mail?.subject, to },
        type: MailsEditType.REPLY,
      },
      { pop: true },
    );
  }, [fromFolder, mail, currentUserId, props]);

  const onReplyAll = React.useCallback(() => {
    let to: MailsVisible[] = [];
    if (mail?.from.id !== currentUserId) {
      to.push(convertRecipientUserInfoToVisible(mail!.from));
      if (mail!.to.groups.length > 0 || mail!.to.users.length > 0) {
        let users = mail!.to.users.filter(user => user.id !== currentUserId).map(user => convertRecipientUserInfoToVisible(user));
        let groups = mail!.to.groups.map(group => convertRecipientGroupInfoToVisible(group));
        to = [...to, ...users, ...groups];
      }
    } else {
      let users = mail!.to.users.map(user => convertRecipientUserInfoToVisible(user));
      let groups = mail!.to.groups.map(group => convertRecipientGroupInfoToVisible(group));
      to = [...users, ...groups];
    }

    let cc: MailsVisible[] = [
      ...mail!.cc.users.filter(user => user.id !== currentUserId).map(user => convertRecipientUserInfoToVisible(user)),
      ...mail!.cc.groups.map(group => convertRecipientGroupInfoToVisible(group)),
    ];

    let cci: MailsVisible[] = [
      ...mail!.cci.users.filter(user => user.id !== currentUserId).map(user => convertRecipientUserInfoToVisible(user)),
      ...mail!.cci.groups.map(group => convertRecipientGroupInfoToVisible(group)),
    ];

    props.navigation.navigate(
      mailsRouteNames.edit,
      {
        fromFolder,
        initialMailInfo: {
          body: mail?.body,
          cc,
          cci,
          date: mail?.date,
          from: mail?.from,
          id: mail!.id,
          subject: mail?.subject,
          to,
        },
        type: MailsEditType.REPLY,
      },
      { pop: true },
    );
  }, [fromFolder, mail, currentUserId, props]);

  const onForward = React.useCallback(async () => {
    if (!isServiceMethodAvailable(mailsService.mail.forward)) {
      toast.showError();
      return;
    }
    try {
      const draftId = await mailsService.mail.forward({ id });
      let users = mail!.to.users.map(user => convertRecipientUserInfoToVisible(user));
      let groups = mail!.to.groups.map(group => convertRecipientGroupInfoToVisible(group));
      const to: MailsVisible[] = [...users, ...groups];

      props.navigation.navigate(
        mailsRouteNames.edit,
        {
          draftId,
          fromFolder,
          initialMailInfo: {
            attachments: convertedAttachments,
            body: mail?.body,
            date: mail?.date,
            from: mail?.from,
            id: mail!.id,
            subject: mail?.subject,
            to,
          },
          type: MailsEditType.FORWARD,
        },
        { pop: true },
      );
    } catch (e) {
      console.error('Failed to forward mail', e);
      toast.showError();
    }
  }, [convertedAttachments, fromFolder, id, mail, props.navigation]);

  const onCreateNewFolder = React.useCallback(
    async (valueNewFolder: string) => {
      if (!isServiceMethodAvailable(mailsService.folder.create) || !isServiceMethodAvailable(mailsService.mail.moveToFolder)) {
        toast.showError();
        return;
      }
      try {
        const folderId = await mailsService.folder.create({ name: valueNewFolder });
        await mailsService.mail.moveToFolder({ folderId: folderId }, { ids: [id] });
        props.navigation.navigate(
          mailsRouteNames.home,
          { from: { id: folderId, name: valueNewFolder }, reload: true },
          { pop: true },
        );
        Toast.showSuccess(I18n.get('mails-toastsuccessmove'));
      } catch (e) {
        console.error(e);
      }
    },
    [id, props.navigation],
  );

  const handleMailAction = React.useCallback(
    async (action: () => Promise<void>, successMessageKey: string) => {
      try {
        await action();
        Toast.showSuccess(I18n.get(successMessageKey));
        const navigationParams = {
          from: fromFolder,
          ...(successMessageKey === 'mails-toastsuccessunread'
            ? { idMailToMarkUnread: id }
            : successMessageKey === 'mails-toastsuccessrecall'
              ? { idMailToRecall: id }
              : { idMailToRemove: id }),
        };
        props.navigation.navigate(mailsRouteNames.home, navigationParams, { pop: true });
      } catch (e) {
        console.error(e);
        toast.showError();
      }
    },
    [fromFolder, id, props.navigation],
  );

  const onRecall = () => {
    const recall = mailsService.mail.recall;
    if (!isServiceMethodAvailable(recall)) {
      toast.showError();
      return;
    }
    Alert.alert(I18n.get('mails-details-recalltitle'), I18n.get('mails-details-recalltext'), [
      {
        style: 'cancel',
        text: I18n.get('common-cancel'),
      },
      {
        onPress: () => handleMailAction(() => recall({ id }), 'mails-toastsuccessrecall'),
        style: 'default',
        text: I18n.get('mails-details-recall'),
      },
    ]);
  };

  const onMarkUnread = React.useCallback(() => {
    const toggleUnread = mailsService.mail.toggleUnread;
    if (!isServiceMethodAvailable(toggleUnread)) {
      toast.showError();
      return;
    }
    handleMailAction(() => toggleUnread({ ids: [id], unread: true }), 'mails-toastsuccessunread');
  }, [handleMailAction, id]);

  const onOpenMoveModal = () => {
    setTypeModal(MailsListTypeModal.MOVE);
    bottomSheetModalRef.current?.present();
  };

  const onMove = React.useCallback(
    (folderId: string) => {
      const moveToFolder = mailsService.mail.moveToFolder;
      if (!isServiceMethodAvailable(moveToFolder)) {
        toast.showError();
        return;
      }
      handleMailAction(() => moveToFolder({ folderId }, { ids: [id] }), 'mails-toastsuccessmove');
    },
    [handleMailAction, id],
  );

  const onRemoveFromFolder = React.useCallback(() => {
    const removeFromFolder = mailsService.mail.removeFromFolder;
    if (!isServiceMethodAvailable(removeFromFolder)) {
      toast.showError();
      return;
    }
    handleMailAction(() => removeFromFolder({ ids: [id] }), 'mails-toastsuccessremovefromfolder');
  }, [handleMailAction, id]);

  const onRestore = React.useCallback(() => {
    const restore = mailsService.mail.restore;
    if (!isServiceMethodAvailable(restore)) {
      toast.showError();
      return;
    }
    handleMailAction(() => restore({ ids: [id] }), 'mails-toastsuccessrestore');
  }, [handleMailAction, id]);

  const onTrash = React.useCallback(() => {
    if (!isServiceMethodAvailable(mailsService.mail.moveToTrash)) {
      toast.showError();
      return;
    }
    handleMailAction(() => mailsService.mail.moveToTrash({ ids: [id] }), 'mails-toastsuccesstrash');
  }, [handleMailAction, id]);

  const onDelete = React.useCallback(() => {
    if (!isServiceMethodAvailable(mailsService.mail.delete)) {
      toast.showError();
      return;
    }
    handleMailAction(() => mailsService.mail.delete({ ids: [id] }), 'mails-toastsuccessdelete');
  }, [handleMailAction, id]);

  const replayAction = mail?.noReply
    ? []
    : [
        {
          action: onReply,
          icon: {
            android: 'ic_reply',
            ios: 'arrowshape.turn.up.left',
          },
          id: 'reply',
          title: I18n.get('mails-details-reply'),
        },
        {
          action: onReplyAll,
          icon: {
            android: 'ic_reply',
            ios: 'arrowshape.turn.up.left.2',
          },
          id: 'replyAll',
          title: I18n.get('mails-details-replyall'),
        },
        ...(isServiceMethodAvailable(mailsService.mail.forward)
          ? [
              {
                action: onForward,
                icon: {
                  android: 'ic_forward',
                  ios: 'arrowshape.turn.up.forward',
                },
                id: 'forward',
                title: I18n.get('mails-details-forward'),
              },
            ]
          : []),
      ];
  const allPopupActionsMenu = [
    ...replayAction,
    ...(isServiceMethodAvailable(mailsService.mail.recall)
      ? [
          {
            action: onRecall,
            icon: {
              android: 'ic_recall',
              ios: 'arrow.uturn.backward.circle',
            },
            id: 'recall',
            title: I18n.get('mails-details-recallpopup'),
          },
        ]
      : []),
    ...(isServiceMethodAvailable(mailsService.mail.toggleUnread)
      ? [
          {
            action: onMarkUnread,
            icon: {
              android: 'ic_visibility_off',
              ios: 'envelope.badge',
            },
            id: 'markUnread',
            title: I18n.get('mails-details-markunread'),
          },
        ]
      : []),
    ...(isServiceMethodAvailable(mailsService.mail.moveToFolder)
      ? [
          {
            action: onOpenMoveModal,
            icon: {
              android: 'ic_move_to_inbox',
              ios: 'tray.2',
            },
            id: 'move',
            title: I18n.get('mails-details-move'),
          },
        ]
      : []),
    ...(isServiceMethodAvailable(mailsService.mail.removeFromFolder)
      ? [
          {
            action: onRemoveFromFolder,
            icon: {
              android: 'ic_remove_from_folder',
              ios: 'xmark.bin',
            },
            id: 'removeFromFolder',
            title: I18n.get('mails-details-removefromfolder'),
          },
        ]
      : []),
    ...(isServiceMethodAvailable(mailsService.mail.restore)
      ? [
          {
            action: onRestore,
            icon: {
              android: 'ic_restore',
              ios: 'arrow.uturn.backward.circle',
            },
            id: 'restore',
            title: I18n.get('mails-details-restore'),
          },
        ]
      : []),
    ...((
      fromFolder === MailsDefaultFolders.TRASH
        ? isServiceMethodAvailable(mailsService.mail.delete)
        : isServiceMethodAvailable(mailsService.mail.moveToTrash)
    )
      ? [
          {
            action: fromFolder === MailsDefaultFolders.TRASH ? onDelete : onTrash,
            destructive: true,
            icon: {
              android: 'ic_delete_item',
              ios: 'trash',
            },
            id: 'delete',
            title: I18n.get('common-delete'),
          },
        ]
      : []),
  ];

  const popupActionsMenu = allPopupActionsMenu.filter(({ id: actionId }) => {
    switch (actionId) {
      case 'reply':
        return fromFolder !== MailsDefaultFolders.TRASH && !isRecall;
      case 'replyAll':
        return infosRecipients && infosRecipients.ids.length > 1 && fromFolder !== MailsDefaultFolders.TRASH && !isRecall;
      case 'forward':
        return fromFolder !== MailsDefaultFolders.TRASH && !isRecallAndNotSender;
      case 'recall':
        return canRecall;
      case 'markUnread':
        return fromFolder !== MailsDefaultFolders.TRASH && mail?.from.id !== currentUserId;
      case 'move':
        return fromFolder !== MailsDefaultFolders.TRASH;
      case 'removeFromFolder': {
        const defaultFolders: MailsDefaultFolders[] = [
          MailsDefaultFolders.TRASH,
          MailsDefaultFolders.INBOX,
          MailsDefaultFolders.OUTBOX,
        ];
        return typeof fromFolder === 'object' && 'id' in fromFolder ? true : !defaultFolders.includes(fromFolder);
      }
      case 'restore':
        return fromFolder === MailsDefaultFolders.TRASH;
      case 'delete':
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
          onPress={() =>
            fromTimeline
              ? props.navigation.goBack()
              : props.navigation.navigate(mailsRouteNames.home, { from: fromFolder }, { pop: true })
          }
        />
      ),
      headerRight: () =>
        mail?.trashed || isRecall ? (
          <PopupMenu actions={popupActionsMenu}>
            <NavBarAction icon="ui-options" />
          </PopupMenu>
        ) : (
          <NavBarActionsGroup
            elements={[
              ...(mail?.noReply ? [] : [<NavBarAction disabled={isLoading} icon="ui-undo" onPress={onReply} />]),
              <PopupMenu disabled={isLoading} actions={popupActionsMenu}>
                <NavBarAction icon="ui-options" />
              </PopupMenu>,
            ]}
          />
        ),
    });
  }, [mail, isRecall, onReply, popupActionsMenu, props, fromFolder, fromTimeline, isLoading]);

  const renderContentViewer = React.useCallback(() => {
    if (isContentEmpty) return;
    return <RichEditorViewer content={mailContent} />;
  }, [isContentEmpty, mailContent]);

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

  const renderRecall = React.useCallback(
    () => (
      <EmptyScreen
        customStyle={{ backgroundColor: theme.palette.grey.white }}
        svgImage="empty-recall"
        title={I18n.get('mails-details-recallscreentitle')}
        text={I18n.get('mails-details-recallscreentext')}
      />
    ),
    [],
  );

  const renderAttachments = React.useCallback(() => {
    if (mail!.attachments.length <= 0) return;
    // Carbonio: open attachments in web instead of using the base Attachments component
    if (isServiceMethodAvailable(mailsService.mail.rederictToWebview) && !mailsService.attachments.supportViewAttachments) {
      const onOpenWeb = async () => {
        const url = await mailsService.mail.rederictToWebview!({ folderId: mail?.folder_id ?? '', id });
        openUrl(url);
      };
      return (
        <View style={styles.attachmentsExternal}>
          {mail!.attachments.map(att => (
            <TouchableOpacity key={att.id} onPress={onOpenWeb} style={styles.attachmentExternalContainer}>
              <Svg
                name="ui-attachment"
                fill={theme.palette.grey.black}
                width={UI_SIZES.elements.icon.medium}
                height={UI_SIZES.elements.icon.medium}
              />
              <BodyText style={styles.attachmentCarbonioLabel} numberOfLines={1}>
                {att.filename || ''}
              </BodyText>
            </TouchableOpacity>
          ))}
        </View>
      );
    }
    return <Attachments session={props.session!} attachments={convertedAttachments} />;
  }, [convertedAttachments, id, mail, props.session]);

  const renderOriginalContent = React.useCallback(() => {
    const navigateToOriginalContent = () => {
      props.navigation.navigate(mailsRouteNames.originalContent, { id }, { pop: true });
    };

    if (!mail?.original_format_exists) return;
    return (
      <TertiaryButton
        style={styles.originalContent}
        text={I18n.get('mails-details-originalcontent')}
        action={navigateToOriginalContent}
      />
    );
  }, [id, mail?.original_format_exists, props.navigation]);

  const renderHistory = React.useCallback(() => {
    if (!mailHistory) return <Separator marginVertical={UI_SIZES.spacing.big} />;
    return <MailsHistoryButton content={mailHistory} />;
  }, [mailHistory]);

  const renderButtons = React.useCallback(() => {
    if (mail?.trashed || isRecallAndNotSender) return null;

    const isMultipleRecipients = infosRecipients && infosRecipients.ids.length > 1;
    const renderForwardButton = () =>
      isServiceMethodAvailable(mailsService.mail.forward) ? (
        <SecondaryButton iconLeft="ui-redo" text={I18n.get('mails-details-forward')} action={onForward} />
      ) : null;
    const renderReplyButton = () => <SecondaryButton iconLeft="ui-undo" text={I18n.get('mails-details-reply')} action={onReply} />;
    const renderReplyAllButton = () => (
      <SecondaryButton iconLeft="ui-answerall" text={I18n.get('mails-details-replyall')} action={onReplyAll} />
    );

    return (
      <View style={styles.buttons}>
        {isRecall ? (
          renderForwardButton()
        ) : (
          <>
            {!mail?.noReply && renderReplyButton()}
            {!mail?.noReply && (isMultipleRecipients ? renderReplyAllButton() : renderForwardButton())}
          </>
        )}
      </View>
    );
  }, [infosRecipients, isRecall, isRecallAndNotSender, mail?.trashed, mail?.noReply, onForward, onReply, onReplyAll]);

  const hasRecipients = React.useCallback(
    (recipients: MailsRecipients) => recipients.users.length > 0 || recipients.groups.length > 0,
    [],
  );

  const renderListRecipients = React.useCallback(
    (recipients: MailsRecipients, prefix: string) => {
      if (!hasRecipients(recipients)) return;

      const groupArray = Object.entries<MailsRecipientGroupInfo>(recipients.groups)
        .filter(([key]) => key !== 'length')
        .map(([_, value]) => value);

      return (
        <View>
          <SmallBoldText style={styles.bottomSheetPrefix}>{I18n.get(prefix)}</SmallBoldText>

          {recipients.users.length > 0 && recipients.users.map(user => <MailsRecipientUserItem key={user.id} item={user} />)}

          {groupArray.length > 0 && groupArray.map(group => <MailsRecipientGroupItem key={group.id} item={group} />)}
        </View>
      );
    },
    [hasRecipients],
  );

  const renderDetailsRecipients = React.useCallback(
    () => (
      <GHScrollView showsVerticalScrollIndicator={false} bounces={false}>
        <View style={styles.contentBottomSheet}>
          {renderListRecipients(mail!.to, 'mails-prefixto')}
          {hasRecipients(mail!.to) && hasRecipients(mail!.cc) ? <Separator marginVertical={UI_SIZES.spacing.medium} /> : null}
          {renderListRecipients(mail!.cc, 'mails-prefixcc')}
          {hasRecipients(mail!.cc) && hasRecipients(mail!.cci) ? <Separator marginVertical={UI_SIZES.spacing.medium} /> : null}
          {renderListRecipients(mail!.cci, 'mails-prefixcci')}
        </View>
      </GHScrollView>
    ),
    [mail, renderListRecipients, hasRecipients],
  );

  const renderCreateFolder = React.useCallback(
    () => (
      <MailsInputBottomSheet
        title={I18n.get('mails-list-newfolder')}
        onSend={onCreateNewFolder}
        inputLabel={I18n.get('mails-list-newfolderlabel')}
        inputPlaceholder={I18n.get('mails-list-newfolderplaceholder')}
      />
    ),
    [onCreateNewFolder],
  );

  const renderMoveFolder = React.useCallback(
    () =>
      isServiceMethodAvailable(mailsService.mail.moveToFolder) ? (
        <MailsMoveBottomSheet
          onMove={onMove}
          folders={folders}
          mailFolderId={mail!.folder_id}
          onPressCreateFolderButton={
            isServiceMethodAvailable(mailsService.folder.create) ? () => setTypeModal(MailsListTypeModal.CREATE) : undefined
          }
        />
      ) : null,
    [folders, mail, onMove],
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

  const renderRederictToWebview = React.useCallback(() => {
    if (!isServiceMethodAvailable(mailsService.mail.rederictToWebview)) return null;
    const onRedirect = async () => {
      const url = await mailsService.mail.rederictToWebview!({ folderId: mail?.folder_id ?? '', id });
      openUrl(url);
    };
    return (
      <AlertCard
        type="info"
        style={styles.redirectToWebview}
        text={
          <SmallText>
            {I18n.get('mails-details-redirecttowebview')}{' '}
            <NestedActionText onPress={onRedirect}>{I18n.get('mails-details-button-redirecttowebview')}</NestedActionText>
          </SmallText>
        }
      />
    );
  }, [id, mail]);
  const renderContent = React.useCallback(() => {
    if (error) return <EmptyContentScreen />;
    return (
      <PageView>
        <ScrollView style={styles.page}>
          <HeadingXSText>{renderSubject(mail?.subject, isRecall)}</HeadingXSText>
          <View style={styles.topInfos}>
            <SingleAvatar size="lg" userId={mail?.from.id} />
            <View style={styles.topInfosText}>
              <View style={styles.sender}>
                <TouchableOpacity
                  style={styles.touchableSender}
                  onPress={() =>
                    mail?.from.profile !== AccountType.External &&
                    props.navigation.navigate(userRouteNames.profile, { userId: mail?.from.id })
                  }>
                  <SmallBoldText style={styles.senderName} numberOfLines={1} ellipsizeMode="tail">
                    {mail?.from.displayName}
                  </SmallBoldText>
                </TouchableOpacity>
                <SmallItalicText>{displayPastDate(moment(mail?.date))}</SmallItalicText>
              </View>
              {renderRecipients()}
            </View>
          </View>
          {isRecallAndNotSender ? (
            renderRecall()
          ) : (
            <>
              {renderContentViewer()}
              {renderAttachments()}
              {renderOriginalContent()}
              {renderHistory()}
              {renderRederictToWebview()}
              {renderButtons()}
              {mail?.noReply && (
                <AlertCard
                  type="warning"
                  text={
                    mail.from.id === currentUserId
                      ? I18n.get('mails-no-reply-disabled-sender-info-text')
                      : I18n.get('mails-no-reply-disabled-info-text')
                  }
                />
              )}
            </>
          )}
        </ScrollView>
        {renderBottomSheet()}
      </PageView>
    );
  }, [
    error,
    mail,
    currentUserId,
    isRecall,
    renderRecipients,
    isRecallAndNotSender,
    renderRecall,
    renderContentViewer,
    renderAttachments,
    renderOriginalContent,
    renderHistory,
    renderButtons,
    renderBottomSheet,
    props.navigation,
    renderRederictToWebview,
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
