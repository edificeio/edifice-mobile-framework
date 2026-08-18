import * as React from 'react';
import { ActivityIndicator, Modal, View } from 'react-native';

import type { NativeStackNavigationOptions, NativeStackScreenProps } from '@react-navigation/native-stack';
import { connect } from 'react-redux';

import { I18n } from '~/app/i18n';
import theme from '~/app/theme';
import { EmptyConnectionScreen } from '~/framework/components/empty-screens';
import { RichEditorForm } from '~/framework/components/inputs/rich-text';
import PopupMenu from '~/framework/components/menus/popup';
import { NavBarAction, NavBarActionsGroup } from '~/framework/components/navigation';
import { ContentLoader } from '~/framework/hooks/loader';
import { getSession } from '~/framework/modules/auth/redux/reducer';
import Attachments from '~/framework/modules/mails/components/attachments';
import { MailsContactField, MailsSubjectField } from '~/framework/modules/mails/components/fields';
import MailsHistoryButton from '~/framework/modules/mails/components/history-button';
import { InactiveUserModalContentContainer } from '~/framework/modules/mails/components/modal-content-container';
import MailsPlaceholderEdit from '~/framework/modules/mails/components/placeholder/edit';
import { MailsRecipientsType } from '~/framework/modules/mails/model';
import { MailsNavigationParams, mailsRouteNames } from '~/framework/modules/mails/navigation';
import { getMailCarbonioRight, getNoReplyRight } from '~/framework/modules/mails/rights';
import { mailsService } from '~/framework/modules/mails/service';
import { isServiceMethodAvailable } from '~/framework/modules/mails/util';
import { LocalFile } from '~/framework/util/fileHandler/models';
import { navBarOptions } from '~/framework/navigation/navBar';

import styles from './styles';
import { type MailsEditScreenPrivateProps } from './types';
import { useMailsEditController } from './useController';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { UI_SIZES } from '~/framework/components/constants';

export const computeNavBar = ({
  navigation,
  route,
}: NativeStackScreenProps<MailsNavigationParams, typeof mailsRouteNames.edit>): NativeStackNavigationOptions => ({
  ...navBarOptions({
    navigation,
    route,
    title: '',
  }),
});

const MailsEditScreen = (props: MailsEditScreenPrivateProps) => {
  const { navigation, route, session } = props;
  const {
    actions: {
      loadData,
      onChangeRecipient,
      onChangeSubject,
      onChangeText,
      onCheckSend,
      onCloseInactiveUserModal,
      onFocus,
      onImportAttachmentsResult,
      onOpenHistory,
      onPressAddAttachments,
      onRemoveAttachment,
      onScrollBeginDrag,
      onToggleShowList,
      openMoreRecipientsFields,
    },
    computed: { haveInitialCcCci, noReplyMenu, popupActionsMenu, shouldSaveDraft },
    refs: { editorRef, scrollViewRef },
    state: {
      attachments,
      bodyContent,
      cc,
      cci,
      draftIdSaved,
      history,
      inactiveUserModalVisible,
      inactiveUsersList,
      initialContentHTML,
      inputFocused,
      isHistoryOpen,
      isSending,
      isStartScroll,
      mailSubjectType,
      moreRecipientsFields,
      scrollEnabled,
      subject,
      to,
    },
  } = useMailsEditController({ navigation, route });
  const hasRecipients = to.length > 0 || cc.length > 0 || cci.length > 0;
  const hasContentToSend = subject.trim().length > 0 || bodyContent?.trim().length > 0;
  // The blocking "sending" overlay only applies to Carbonio: slow sends there are typically
  // caused by server-side group/distribution-list expansion, which Classic doesn't have the
  // same way — showing it for Classic's normally-instant sends was reported as a regression.
  const isCarbonioSending = isSending && !!(session && getMailCarbonioRight(session));

  React.useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <NavBarActionsGroup
          elements={[
            <NavBarAction icon="ui-send" disabled={isCarbonioSending || !hasRecipients || !hasContentToSend} onPress={onCheckSend} />,
            <PopupMenu
              disabled={isCarbonioSending || (!shouldSaveDraft && !(props.session && getNoReplyRight(props.session)))}
              actions={
                draftIdSaved
                  ? [...(props.session && getNoReplyRight(props.session) ? noReplyMenu : []), ...popupActionsMenu]
                  : [...(props.session && getNoReplyRight(props.session) ? noReplyMenu : []), ...popupActionsMenu.slice(0, -1)]
              }>
              <NavBarAction icon="ui-options" />
            </PopupMenu>,
          ]}
        />
      ),
      title: '',
    });
  }, [
    draftIdSaved,
    hasContentToSend,
    hasRecipients,
    isCarbonioSending,
    navigation,
    noReplyMenu,
    onCheckSend,
    popupActionsMenu,
    props.session,
    shouldSaveDraft,
  ]);

  const renderTopForm = React.useCallback(() => {
    const commonProps = {
      inputFocused,
      isAdml: session?.user.isAdml ?? false,
      isStartScroll,
      onChangeRecipient,
      onFocus: onFocus,
      onToggleShowList: onToggleShowList,
      scrollViewRef,
    };

    return (
      <View>
        <MailsContactField
          type={MailsRecipientsType.TO}
          recipients={to}
          onOpenMoreRecipientsFields={openMoreRecipientsFields}
          hideCcCciButton={haveInitialCcCci}
          {...commonProps}
        />
        {moreRecipientsFields || haveInitialCcCci ? (
          <>
            <MailsContactField type={MailsRecipientsType.CC} recipients={cc} {...commonProps} />
            <MailsContactField type={MailsRecipientsType.CCI} recipients={cci} {...commonProps} />
          </>
        ) : null}
        <MailsSubjectField subject={subject} type={mailSubjectType} onChangeText={onChangeSubject} />
      </View>
    );
  }, [
    inputFocused,
    session?.user.isAdml,
    isStartScroll,
    onChangeRecipient,
    onFocus,
    onToggleShowList,
    scrollViewRef,
    to,
    openMoreRecipientsFields,
    haveInitialCcCci,
    moreRecipientsFields,
    cc,
    cci,
    subject,
    mailSubjectType,
    onChangeSubject,
  ]);

  const { bottom } = useSafeAreaInsets();

  const renderBottomForm = React.useCallback(
    () => (
      <View style={[styles.bottomForm, { paddingBottom: Math.max(bottom, UI_SIZES.spacing.minor) }]}>
        {history !== '' && !isHistoryOpen ? <MailsHistoryButton content={history} onPress={onOpenHistory} /> : null}
        {isServiceMethodAvailable(mailsService.attachments.remove) && isServiceMethodAvailable(mailsService.attachments.add) ? (
          <Attachments
            session={session!}
            isEditing
            attachments={attachments}
            removeAttachmentAction={onRemoveAttachment}
            draftId={draftIdSaved}
            onPressAddAttachments={onPressAddAttachments}
            onImportAttachmentsResult={onImportAttachmentsResult}
          />
        ) : null}
        <View style={styles.bottomSheet} />
      </View>
    ),
    [
      bottom,
      history,
      isHistoryOpen,
      onOpenHistory,
      session,
      attachments,
      onRemoveAttachment,
      draftIdSaved,
      onPressAddAttachments,
      onImportAttachmentsResult,
    ],
  );

  const carbonioInlineUpload = mailsService.attachments.uploadInlineImage;
  const onInlineImageUpload = React.useMemo(() => {
    if (!carbonioInlineUpload || !draftIdSaved) return undefined;
    return (file: LocalFile) => carbonioInlineUpload({ draftId: draftIdSaved }, file);
  }, [carbonioInlineUpload, draftIdSaved]);
  // For Carbonio, disable the image picker until the draft is created so the upload
  // has a valid draftId. For Entcore, the upload goes through workspace independently.
  const allowMultimediaUpload = carbonioInlineUpload
    ? !!draftIdSaved
    : (mailsService.attachments.allowMultimediaUpload ?? true);

  const renderContent = React.useCallback(() => {
    return (
      <>
        <RichEditorForm
          ref={scrollViewRef}
          editorRef={editorRef}
          topForm={renderTopForm()}
          initialContentHtml={initialContentHTML}
          editorStyle={styles.editor}
          bottomForm={renderBottomForm()}
          onChangeText={onChangeText}
          scrollEnabled={scrollEnabled}
          saving={true}
          uploadParams={{
            parent: 'protected',
          }}
          placeholder={I18n.get('mails-edit-contentplaceholder')}
          onScrollBeginDrag={onScrollBeginDrag}
          onInlineImageUpload={onInlineImageUpload}
          allowMultimediaUpload={allowMultimediaUpload}
        />
        <InactiveUserModalContentContainer
          isVisible={inactiveUserModalVisible}
          inactiveUsers={inactiveUsersList}
          action={onCloseInactiveUserModal}
        />
        {/* Full-screen blocking overlay while sending (Carbonio only): a slow send (e.g. to a
            large group) must disable every action on the screen, including typing, not just the
            header buttons (see INTEG-2132). */}
        <Modal visible={isCarbonioSending} transparent animationType="fade" statusBarTranslucent>
          <View style={styles.sendingOverlay}>
            <ActivityIndicator size="large" color={theme.palette.grey.white} />
          </View>
        </Modal>
      </>
    );
  }, [
    scrollViewRef,
    editorRef,
    renderTopForm,
    initialContentHTML,
    renderBottomForm,
    onChangeText,
    scrollEnabled,
    onScrollBeginDrag,
    onInlineImageUpload,
    inactiveUserModalVisible,
    inactiveUsersList,
    onCloseInactiveUserModal,
    isCarbonioSending,
  ]);

  return (
    <ContentLoader
      loadContent={loadData}
      renderContent={renderContent}
      renderError={() => <EmptyConnectionScreen />}
      renderLoading={() => <MailsPlaceholderEdit />}
    />
  );
};

export default connect(() => ({
  session: getSession(),
}))(MailsEditScreen);
