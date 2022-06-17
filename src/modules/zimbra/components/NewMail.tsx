import I18n from 'i18n-js';
import React from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TextInput, View, ViewStyle } from 'react-native';
import { hasNotch } from 'react-native-device-info';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import { LoadingIndicator } from '~/framework/components/loading';
import { Icon } from '~/framework/components/picture/Icon';
import { Text } from '~/framework/components/text';
import Notifier from '~/infra/notifier/container';
import { ISearchUsers } from '~/modules/zimbra/service/newMail';
import { CommonStyles } from '~/styles/common/styles';
import { PageContainer } from '~/ui/ContainerContent';
import TouchableOpacity from '~/ui/CustomTouchableOpacity';
import { HtmlContentView } from '~/ui/HtmlContentView';

import Attachment from './Attachment';
import SearchUserMail from './SearchUserMail';

// STYLES
const styles = StyleSheet.create({
  fullView: {
    flex: 1,
  },
  fullGrowView: {
    flexGrow: 1,
  },
  mailPart: {
    padding: 5,
    backgroundColor: theme.palette.grey.white,
  },
  lineSeparator: {
    marginLeft: 15,
    width: '50%',
    borderColor: theme.palette.grey.grey,
    borderBottomWidth: 1,
    borderRadius: 1,
  },
  signatureZoneContainer: {
    flexGrow: 1,
    padding: 8,
  },
  signatureZone: {
    backgroundColor: theme.palette.grey.white,
    minHeight: 40,
    maxHeight: UI_SIZES.screen.height / 3,
    paddingHorizontal: 10,
  },
  attachmentView: {
    padding: 0,
  },
  headerContainer: {
    zIndex: 4,
  },
  headerUsersCc: {
    zIndex: 3,
  },
  headerUsersBcc: {
    zIndex: 2,
  },
  newMailHeaders: {
    zIndex: 3,
  },
  newMailAttachments: {
    zIndex: 2,
  },
  newMailBody: {
    zIndex: 1,
  },
});

// COMPONENTS

const HeaderUsers = ({
  style,
  title,
  onChange,
  value,
  children,
  hasRightToSendExternalMails,
}: React.PropsWithChildren<{
  style?: ViewStyle;
  title: string;
  onChange;
  onSave;
  forUsers?: boolean;
  value: any;
  hasRightToSendExternalMails: boolean;
}>) => {
  const headerStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
    paddingHorizontal: 10,
  } as ViewStyle;

  return (
    <View style={[headerStyle, style]}>
      <Text style={{ color: CommonStyles.lightTextColor }}>{title} : </Text>
      <SearchUserMail
        selectedUsersOrGroups={value}
        onChange={val => onChange(val)}
        hasRightToSendExternalMails={hasRightToSendExternalMails}
      />
      {children}
    </View>
  );
};

const HeaderSubject = ({
  style,
  title,
  onChange,
  onSave,
  value,
}: React.PropsWithChildren<{ style?: ViewStyle; title: string; onChange; onSave; forUsers?: boolean; value: any }>) => {
  const headerStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
    paddingHorizontal: 10,
  } as ViewStyle;

  const inputStyle = {
    flex: 1,
    height: 40,
    color: CommonStyles.textColor,
    borderBottomColor: theme.palette.grey.pearl,
    borderBottomWidth: 2,
  } as ViewStyle;

  const textUpdateTimeout = React.useRef();
  const [currentValue, updateCurrentValue] = React.useState(value);

  React.useEffect(() => {
    window.clearTimeout(textUpdateTimeout.current);
    textUpdateTimeout.current = window.setTimeout(() => onChange(currentValue), 500);

    return () => {
      window.clearTimeout(textUpdateTimeout.current);
    };
  }, [currentValue]);

  return (
    <View style={[headerStyle, style]}>
      <Text style={{ color: CommonStyles.lightTextColor }}>{title} : </Text>
      <TextInput
        style={inputStyle}
        defaultValue={value}
        numberOfLines={1}
        onChangeText={text => updateCurrentValue(text)}
        onEndEditing={() => onSave()}
      />
    </View>
  );
};

const Headers = ({ style, headers, onChange, onSave, hasRightToSendExternalMails }) => {
  const [showExtraFields, toggleExtraFields] = React.useState(false);

  return (
    <View style={[styles.mailPart, style]}>
      <HeaderUsers
        style={styles.headerContainer}
        value={headers.to}
        onChange={to => onChange({ ...headers, to })}
        onSave={() => onSave()}
        title={I18n.t('zimbra-to')}
        hasRightToSendExternalMails={hasRightToSendExternalMails}>
        <TouchableOpacity onPress={() => toggleExtraFields(!showExtraFields)}>
          <Icon name={showExtraFields ? 'keyboard_arrow_up' : 'keyboard_arrow_down'} size={28} />
        </TouchableOpacity>
      </HeaderUsers>
      {showExtraFields && (
        <>
          <HeaderUsers
            style={styles.headerUsersCc}
            title={I18n.t('zimbra-cc')}
            value={headers.cc}
            onChange={cc => onChange({ ...headers, cc })}
            onSave={() => onSave()}
            hasRightToSendExternalMails={hasRightToSendExternalMails}
          />
          <HeaderUsers
            style={styles.headerUsersBcc}
            title={I18n.t('zimbra-bcc')}
            value={headers.bcc}
            onChange={bcc => onChange({ ...headers, bcc })}
            onSave={() => onSave()}
            hasRightToSendExternalMails={hasRightToSendExternalMails}
          />
        </>
      )}
      <HeaderSubject
        title={I18n.t('zimbra-subject')}
        value={headers.subject}
        onChange={subject => onChange({ ...headers, subject })}
        onSave={() => onSave()}
      />
    </View>
  );
};

const Attachments = ({ style, attachments, onChange, onDelete, onSave }) => {
  const removeAttachment = id => {
    const newAttachments = attachments.filter(item => item.id !== id);
    onDelete(id);
    onChange(newAttachments);
  };

  return attachments.length === 0 ? (
    <View />
  ) : (
    <View style={[styles.mailPart, style, styles.attachmentView]}>
      {attachments.map(att => (
        <Attachment
          name={att.filename}
          type={att.filetype}
          uploadSuccess={!!att.url && onSave()}
          onRemove={() => removeAttachment(att.id)}
        />
      ))}
    </View>
  );
};

const Body = ({ style, value, onChange, onSave }) => {
  const textUpdateTimeout = React.useRef();
  const [currentValue, updateCurrentValue] = React.useState(value);

  React.useEffect(() => {
    window.clearTimeout(textUpdateTimeout.current);
    textUpdateTimeout.current = window.setTimeout(() => onChange(currentValue), 500);

    return () => {
      window.clearTimeout(textUpdateTimeout.current);
    };
  }, [currentValue]);

  return (
    <View style={[styles.mailPart, style, styles.fullGrowView]}>
      <TextInput
        placeholder={I18n.t('zimbra-type-message')}
        textAlignVertical="top"
        multiline
        scrollEnabled={false}
        style={styles.fullGrowView}
        defaultValue={value}
        onChangeText={text => updateCurrentValue(text)}
        onEndEditing={() => onSave()}
      />
    </View>
  );
};

const PrevBody = ({ prevBody }) => (
  <View style={[styles.mailPart, styles.fullGrowView]}>
    <View style={styles.lineSeparator} />
    <HtmlContentView html={prevBody} />
  </View>
);

const Signature = ({ signatureText }: { signatureText: string }) => (
  <View style={styles.signatureZone}>
    <View style={styles.lineSeparator} />
    <ScrollView style={styles.signatureZone} contentContainerStyle={styles.signatureZoneContainer}>
      <Text>{signatureText}</Text>
    </ScrollView>
  </View>
);

// TYPES & INTERFACES

type HeadersProps = { to: ISearchUsers; cc: ISearchUsers; bcc: ISearchUsers; subject: string };

type IAttachment = {
  id?: string;
  filename: string;
  contentType: string;
  size?: number;
};

interface NewMailComponentProps {
  isFetching: boolean;
  headers: HeadersProps;
  onDraftSave: () => void;
  onHeaderChange: (header: Headers) => void;
  body: string;
  onBodyChange: (body: string) => void;
  attachments: IAttachment[];
  onAttachmentChange: (attachments: IAttachment[]) => void;
  onAttachmentDelete: (attachmentId: string) => void;
  prevBody: any;
  signature: { text: string; useGlobal: boolean };
  isNewSignature: boolean;
  hasRightToSendExternalMails: boolean;
}

// EXPORTED COMPONENTS

export default ({
  isFetching,
  headers,
  onDraftSave,
  onHeaderChange,
  body,
  onBodyChange,
  attachments,
  onAttachmentChange,
  onAttachmentDelete,
  prevBody,
  signature,
  isNewSignature,
  hasRightToSendExternalMails,
}: NewMailComponentProps) => {
  return (
    <PageContainer>
      <Notifier id="zimbra" />
      <KeyboardAvoidingView
        enabled
        behavior={Platform.select({ ios: 'padding' })}
        style={styles.fullView}
        keyboardVerticalOffset={Platform.OS === 'ios' ? (hasNotch() ? 100 : 76) : undefined}>
        {isFetching ? (
          <LoadingIndicator />
        ) : (
          <ScrollView contentContainerStyle={styles.fullGrowView} bounces={false} keyboardShouldPersistTaps="never">
            <Headers
              style={styles.newMailHeaders}
              headers={headers}
              onChange={onHeaderChange}
              onSave={onDraftSave}
              hasRightToSendExternalMails={hasRightToSendExternalMails}
            />
            <Attachments
              style={styles.newMailAttachments}
              attachments={attachments}
              onChange={onAttachmentChange}
              onDelete={onAttachmentDelete}
              onSave={onDraftSave}
            />
            <Body style={styles.newMailBody} value={body} onChange={onBodyChange} onSave={onDraftSave} />
            {!!prevBody && prevBody !== '' && <PrevBody prevBody={prevBody} />}
            {!!signature && (signature.useGlobal || isNewSignature) && signature.text !== '' && (
              <Signature signatureText={signature.text} />
            )}
          </ScrollView>
        )}
      </KeyboardAvoidingView>
    </PageContainer>
  );
};
