import I18n from "i18n-js";
import React from "react";
import { ScrollView, View, StyleSheet, TextInput, ViewStyle } from "react-native";

import Notifier from "../../../infra/notifier/container";
import { CommonStyles, IOSShadowStyle } from "../../../styles/common/styles";
import { Icon, Loading } from "../../../ui";
import ConnectionTrackingBar from "../../../ui/ConnectionTrackingBar";
import { PageContainer } from "../../../ui/ContainerContent";
import TouchableOpacity from "../../../ui/CustomTouchableOpacity";
import { HtmlContentView } from "../../../ui/HtmlContentView";
import { Text } from "../../../ui/Typography";
import { ISearchUsers } from "../service/newMail";
import Attachment from "./Attachment";
import SearchUserMail from "./SearchUserMail";

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
}

const styles = StyleSheet.create({
  mailPart: {
    padding: 5,
    backgroundColor: "white",
    elevation: CommonStyles.elevation,
    ...IOSShadowStyle,
  },
  lineSeparator: {
    marginLeft: 15,
    width: "50%",
    borderStyle: "dashed",
    borderBottomWidth: 1,
    borderRadius: 1,
  },
});

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
}: NewMailComponentProps) => {
  return (
    <PageContainer>
      <ConnectionTrackingBar />
      <Notifier id="zimbra" />
      {isFetching ? (
        <Loading />
      ) : (
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} bounces={false} keyboardShouldPersistTaps="never">
          <Headers style={{ zIndex: 3 }} headers={headers} onChange={onHeaderChange} onSave={onDraftSave} />
          <Attachments
            style={{ zIndex: 2 }}
            attachments={attachments}
            onChange={onAttachmentChange}
            onDelete={onAttachmentDelete}
            onSave={onDraftSave}
          />
          <Body style={{ zIndex: 1 }} value={body} onChange={onBodyChange} onSave={onDraftSave} />
          {!!prevBody && <PrevBody prevBody={prevBody} />}
        </ScrollView>
      )}
    </PageContainer>
  );
};

const HeaderUsers = ({
  style,
  title,
  onChange,
  value,
  children,
}: React.PropsWithChildren<{ style?: ViewStyle; title: string; onChange; onSave; forUsers?: boolean; value: any }>) => {
  const headerStyle = {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 5,
    paddingHorizontal: 10,
  } as ViewStyle;

  return (
    <View style={[headerStyle, style]}>
      <Text style={{ color: CommonStyles.lightTextColor }}>{title} : </Text>
      <SearchUserMail selectedUsersOrGroups={value} onChange={val => onChange(val)} />
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
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 5,
    paddingHorizontal: 10,
  } as ViewStyle;

  const inputStyle = {
    flex: 1,
    height: 40,
    color: CommonStyles.textColor,
    borderBottomColor: "#EEEEEE",
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

const Headers = ({ style, headers, onChange, onSave }) => {
  const [showExtraFields, toggleExtraFields] = React.useState(false);
  const { to, cc, bcc, subject } = headers;

  return (
    <View style={[styles.mailPart, style]}>
      <HeaderUsers
        style={{ zIndex: 4 }}
        value={to}
        onChange={to => onChange({ ...headers, to })}
        onSave={() => onSave()}
        title={I18n.t("zimbra-to")}>
        <TouchableOpacity onPress={() => toggleExtraFields(!showExtraFields)}>
          <Icon name={showExtraFields ? "keyboard_arrow_up" : "keyboard_arrow_down"} size={28} />
        </TouchableOpacity>
      </HeaderUsers>
      {showExtraFields && (
        <>
          <HeaderUsers
            style={{ zIndex: 3 }}
            title={I18n.t("zimbra-cc")}
            value={cc}
            onChange={cc => onChange({ ...headers, cc })}
            onSave={() => onSave()}
          />
          <HeaderUsers
            style={{ zIndex: 2 }}
            title={I18n.t("zimbra-bcc")}
            value={bcc}
            onChange={bcc => onChange({ ...headers, bcc })}
            onSave={() => onSave()}
          />
        </>
      )}
      <HeaderSubject
        title={I18n.t("zimbra-subject")}
        value={subject}
        onChange={subject => onChange({ ...headers, subject })}
        onSave={() => onSave()}
      />
    </View>
  );
};

const Attachments = ({ style, attachments, onChange, onDelete, onSave }) => {
  const removeAttachment = id => {
    // console.log("delete", id, attachments);
    const newAttachments = attachments.filter(item => item.id !== id);
    onDelete(id);
    onChange(newAttachments);
  };

  // console.log("render attachments", attachments);

  return attachments.length === 0 ? (
    <View />
  ) : (
    <View style={[styles.mailPart, style, { padding: 0 }]}>
      {attachments.map(att => (
        <Attachment
          uploadSuccess={!!att.url && onSave()}
          fileType={att.filetype}
          fileName={att.filename}
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
    <View style={[styles.mailPart, style, { flexGrow: 1 }]}>
      <TextInput
        placeholder={I18n.t("zimbra-type-message")}
        textAlignVertical="top"
        multiline
        scrollEnabled={false}
        style={{ flexGrow: 1 }}
        defaultValue={value}
        onChangeText={text => updateCurrentValue(text)}
        onEndEditing={() => onSave()}
      />
    </View>
  );
};

const PrevBody = ({ prevBody }) => {
  return (
    <View style={[styles.mailPart, { flexGrow: 1 }]}>
      <View style={styles.lineSeparator} />
      <HtmlContentView html={prevBody} />
    </View>
  );
};
