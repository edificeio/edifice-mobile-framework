import * as React from 'react';
import { View } from 'react-native';

import { UNSTABLE_usePreventRemove } from '@react-navigation/native';
import type { NativeStackNavigationOptions, NativeStackScreenProps } from '@react-navigation/native-stack';
import { connect } from 'react-redux';

import styles from './styles';
import { type MailsEditScreenPrivateProps } from './types';
import { useMailsEditController } from './useController';

import { I18n } from '~/app/i18n';
import { EmptyConnectionScreen } from '~/framework/components/empty-screens';
import { RichEditorForm } from '~/framework/components/inputs/rich-text';
import PopupMenu from '~/framework/components/menus/popup';
import { NavBarAction, NavBarActionsGroup } from '~/framework/components/navigation';
import { ContentLoader } from '~/framework/hooks/loader';
import { getSession } from '~/framework/modules/auth/reducer';
import Attachments from '~/framework/modules/mails/components/attachments';
import { MailsContactField, MailsSubjectField } from '~/framework/modules/mails/components/fields';
import MailsHistoryButton from '~/framework/modules/mails/components/history-button';
import { InactiveUserModalContentContainer } from '~/framework/modules/mails/components/modal-content-container';
import MailsPlaceholderEdit from '~/framework/modules/mails/components/placeholder/edit';
import { MailsRecipientsType } from '~/framework/modules/mails/model';
import { MailsNavigationParams, mailsRouteNames } from '~/framework/modules/mails/navigation';
import { navBarOptions, navBarTitle } from '~/framework/navigation/navBar';

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
      onOpenHistory,
      onPressAddAttachments,
      onRemoveAttachment,
      onScrollBeginDrag,
      onSendDraft,
      onToggleShowList,
      openMoreRecipientsFields,
    },
    computed: { haveInitialCcCci, popupActionsMenu, shouldSaveDraft },
    refs: { editorRef, scrollViewRef },
    state: {
      attachments,
      cc,
      cci,
      draftIdSaved,
      history,
      inactiveUserModalVisible,
      inactiveUsersList,
      initialContentHTML,
      inputFocused,
      isHistoryOpen,
      isStartScroll,
      mailSubjectType,
      moreRecipientsFields,
      scrollEnabled,
      subject,
      to,
    },
  } = useMailsEditController({ navigation, route });

  UNSTABLE_usePreventRemove(shouldSaveDraft, () => onSendDraft());

  React.useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <NavBarActionsGroup
          elements={[
            <NavBarAction icon="ui-send" disabled={to.length === 0 && cc.length === 0 && cci.length === 0} onPress={onCheckSend} />,
            <PopupMenu actions={draftIdSaved ? popupActionsMenu : popupActionsMenu.slice(0, -1)}>
              <NavBarAction icon="ui-options" />
            </PopupMenu>,
          ]}
        />
      ),
      headerTitle: navBarTitle('', undefined, undefined, 1, 2),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [to, cc, cci, subject, draftIdSaved, onCheckSend]);

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

  const renderBottomForm = React.useCallback(
    () => (
      <View style={styles.bottomForm}>
        {history !== '' && !isHistoryOpen ? <MailsHistoryButton content={history} onPress={onOpenHistory} /> : null}
        <Attachments
          isEditing
          attachments={attachments}
          removeAttachmentAction={onRemoveAttachment}
          draftId={draftIdSaved}
          onPressAddAttachments={onPressAddAttachments}
        />
        <View style={{ minHeight: 600 }} />
      </View>
    ),
    [history, isHistoryOpen, onOpenHistory, attachments, onRemoveAttachment, draftIdSaved, onPressAddAttachments],
  );

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
        />
        <InactiveUserModalContentContainer
          isVisible={inactiveUserModalVisible}
          inactiveUsers={inactiveUsersList}
          action={onCloseInactiveUserModal}
        />
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
    inactiveUserModalVisible,
    inactiveUsersList,
    onCloseInactiveUserModal,
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
