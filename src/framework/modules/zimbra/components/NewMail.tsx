import I18n from 'i18n-js';
import React from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { hasNotch } from 'react-native-device-info';

import theme from '~/app/theme';
import { UI_SIZES, UI_STYLES } from '~/framework/components/constants';
import { LoadingIndicator } from '~/framework/components/loading';
import { pageGutterSize } from '~/framework/components/page';
import { Picture } from '~/framework/components/picture';
import { SmallText } from '~/framework/components/text';
import { ISearchUsers } from '~/framework/modules/conversation/service/newMail';
import { HtmlContentView } from '~/ui/HtmlContentView';

import { Attachment } from './Attachment';
import SearchUserMail from './SearchUserMail';

const styles = StyleSheet.create({
  bodyInput: {
    flexGrow: 1,
    color: theme.ui.text.regular,
  },
  contentContainer: {
    flexGrow: 1,
    padding: pageGutterSize,
    backgroundColor: theme.palette.grey.white,
  },
  expandActionContainer: {
    padding: UI_SIZES.spacing.minor,
    marginLeft: UI_SIZES.spacing.minor,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: UI_SIZES.spacing.small,
  },
  separatorContainer: {
    width: '50%',
    height: 1,
    backgroundColor: theme.palette.grey.grey,
    marginVertical: UI_SIZES.spacing.minor,
  },
  signatureInput: {
    color: theme.ui.text.regular,
  },
  subjectInput: {
    flex: 1,
    height: 40,
    marginLeft: UI_SIZES.spacing.minor,
    color: theme.ui.text.regular,
    borderBottomColor: theme.palette.grey.pearl,
    borderBottomWidth: 2,
  },
});

const HeaderUsers = ({
  title,
  onChange,
  value,
  children,
  hasRightToSendExternalMails,
}: React.PropsWithChildren<{
  title: string;
  onChange;
  onSave;
  value: any;
  hasRightToSendExternalMails: boolean;
}>) => {
  return (
    <View style={styles.headerRow}>
      <SmallText>{title} : </SmallText>
      <SearchUserMail
        selectedUsersOrGroups={value}
        onChange={val => onChange(val)}
        hasRightToSendExternalMails={hasRightToSendExternalMails}
      />
      {children}
    </View>
  );
};

const HeaderSubject = ({ onChange, onSave, value }: React.PropsWithChildren<{ onChange; onSave; value: any }>) => {
  const textUpdateTimeout = React.useRef<NodeJS.Timeout>();
  const [currentValue, updateCurrentValue] = React.useState(value);

  React.useEffect(() => {
    clearTimeout(textUpdateTimeout.current);
    textUpdateTimeout.current = setTimeout(() => onChange(currentValue), 500);

    return () => {
      clearTimeout(textUpdateTimeout.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentValue]);

  return (
    <View style={styles.headerRow}>
      <SmallText>{I18n.t('zimbra-subject')} : </SmallText>
      <TextInput
        defaultValue={value}
        onChangeText={text => updateCurrentValue(text)}
        onEndEditing={() => onSave()}
        style={styles.subjectInput}
      />
    </View>
  );
};

const Headers = ({ headers, onChange, onSave, hasRightToSendExternalMails }) => {
  const [isExpanded, setExpanded] = React.useState(false);

  return (
    <>
      <HeaderUsers
        value={headers.to}
        onChange={to => onChange({ ...headers, to })}
        onSave={() => onSave()}
        title={I18n.t('zimbra-to')}
        hasRightToSendExternalMails={hasRightToSendExternalMails}>
        <TouchableOpacity onPress={() => setExpanded(!isExpanded)} style={styles.expandActionContainer}>
          <Picture
            type="NamedSvg"
            name={isExpanded ? 'ui-rafterUp' : 'ui-rafterDown'}
            width={20}
            height={20}
            fill={theme.ui.text.regular}
          />
        </TouchableOpacity>
      </HeaderUsers>
      {isExpanded ? (
        <>
          <HeaderUsers
            title={I18n.t('zimbra-cc')}
            value={headers.cc}
            onChange={cc => onChange({ ...headers, cc })}
            onSave={() => onSave()}
            hasRightToSendExternalMails={hasRightToSendExternalMails}
          />
          <HeaderUsers
            title={I18n.t('zimbra-bcc')}
            value={headers.bcc}
            onChange={bcc => onChange({ ...headers, bcc })}
            onSave={() => onSave()}
            hasRightToSendExternalMails={hasRightToSendExternalMails}
          />
        </>
      ) : null}
      <HeaderSubject value={headers.subject} onChange={subject => onChange({ ...headers, subject })} onSave={() => onSave()} />
    </>
  );
};

const Body = ({ value, onChange, onSave }) => {
  const textUpdateTimeout = React.useRef<NodeJS.Timeout>();
  const [currentValue, updateCurrentValue] = React.useState(value);

  React.useEffect(() => {
    clearTimeout(textUpdateTimeout.current);
    textUpdateTimeout.current = setTimeout(() => onChange(currentValue), 500);

    return () => {
      clearTimeout(textUpdateTimeout.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentValue]);

  return (
    <TextInput
      defaultValue={value}
      onChangeText={text => updateCurrentValue(text)}
      onEndEditing={() => onSave()}
      multiline
      textAlignVertical="top"
      scrollEnabled={false}
      placeholder={I18n.t('zimbra-type-message')}
      placeholderTextColor={theme.ui.text.light}
      style={styles.bodyInput}
    />
  );
};

const Signature = ({
  signatureText,
  onSignatureTextChange,
}: {
  signatureText: string;
  onSignatureTextChange: (text: string) => void;
}) => {
  const textUpdateTimeout = React.useRef<NodeJS.Timeout>();
  const [currentValue, updateCurrentValue] = React.useState(signatureText);

  React.useEffect(() => {
    clearTimeout(textUpdateTimeout.current);
    textUpdateTimeout.current = setTimeout(() => onSignatureTextChange(currentValue), 500);

    return () => {
      clearTimeout(textUpdateTimeout.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentValue]);

  return (
    <>
      <View style={styles.separatorContainer} />
      <TextInput
        defaultValue={signatureText}
        onChangeText={text => updateCurrentValue(text)}
        multiline
        textAlignVertical="top"
        scrollEnabled={false}
        style={styles.signatureInput}
      />
    </>
  );
};

type HeadersProps = { to: ISearchUsers; cc: ISearchUsers; bcc: ISearchUsers; subject: string };

type IAttachment = {
  id?: string;
  filename: string;
  contentType: string;
  size?: number;
};

interface NewMailComponentProps {
  attachments: IAttachment[];
  body: string;
  hasRightToSendExternalMails: boolean;
  headers: HeadersProps;
  isFetching: boolean;
  isNewSignature: boolean;
  prevBody: any;
  signature: { text: string; useGlobal: boolean };
  onAttachmentChange: (attachments: IAttachment[]) => void;
  onAttachmentDelete: (attachmentId: string) => void;
  onBodyChange: (body: string) => void;
  onDraftSave: () => void;
  onHeaderChange: (header: Headers) => void;
  onSignatureTextChange: (text: string) => void;
  onSignatureAPIChange: () => void;
}

export default ({
  attachments,
  body,
  hasRightToSendExternalMails,
  headers,
  isFetching,
  isNewSignature,
  prevBody,
  signature,
  onAttachmentChange,
  onAttachmentDelete,
  onBodyChange,
  onDraftSave,
  onHeaderChange,
  onSignatureTextChange,
  onSignatureAPIChange,
}: NewMailComponentProps) => {
  const removeAttachment = (id: string) => {
    const newAttachments = attachments.filter(item => item.id !== id);
    onAttachmentDelete(id);
    onAttachmentChange(newAttachments);
  };

  return (
    <KeyboardAvoidingView
      enabled
      behavior={Platform.select({ ios: 'padding' })}
      style={UI_STYLES.flex1}
      keyboardVerticalOffset={Platform.OS === 'ios' ? (hasNotch() ? 100 : 76) : undefined}>
      {isFetching ? (
        <LoadingIndicator />
      ) : (
        <ScrollView contentContainerStyle={styles.contentContainer} bounces={false} keyboardShouldPersistTaps="handled">
          <Headers
            headers={headers}
            onChange={onHeaderChange}
            onSave={onDraftSave}
            hasRightToSendExternalMails={hasRightToSendExternalMails}
          />
          {attachments.map(att => (
            <Attachment
              key={att.id}
              name={att.filename}
              type={att.filetype}
              uploadSuccess={!!att.id}
              onRemove={() => removeAttachment(att.id)}
            />
          ))}
          <Body value={body} onChange={onBodyChange} onSave={onDraftSave} />
          {prevBody ? (
            <>
              <View style={styles.separatorContainer} />
              <HtmlContentView html={prevBody} />
            </>
          ) : null}
          {!!signature && (signature.useGlobal || isNewSignature) && signature.text !== '' && (
            <Signature signatureText={signature.text} onSignatureTextChange={onSignatureTextChange} />
          )}
        </ScrollView>
      )}
    </KeyboardAvoidingView>
  );
};
