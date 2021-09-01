import I18n from "i18n-js";
import React from "react";
import { ScrollView, View, StyleSheet, TextInput, ViewStyle, SafeAreaView } from "react-native";
import { IDistantFileWithId } from "../../../framework/util/fileHandler";

import Notifier from "../../../infra/notifier/container";
import { CommonStyles } from "../../../styles/common/styles";
import { Icon, Loading } from "../../../ui";
import ConnectionTrackingBar from "../../../ui/ConnectionTrackingBar";
import { PageContainer } from "../../../ui/ContainerContent";
import TouchableOpacity from "../../../ui/CustomTouchableOpacity";
import { HtmlContentView } from "../../../ui/HtmlContentView";
import { Text } from "../../../ui/Typography";
import { ISearchUsers } from "../service/newMail";
import Attachment from "./Attachment";
import SearchUserMail from "./SearchUserMail";

type HeadersProps = { to: ISearchUsers; cc: ISearchUsers; cci: ISearchUsers; subject: string };

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
  attachments: IDistantFileWithId[];
  onAttachmentChange: (attachments: IAttachment[]) => void;
  onAttachmentDelete: (attachmentId: string) => void;
  prevBody: any;
}

const styles = StyleSheet.create({
  mailPart: {
    padding: 5,
    backgroundColor: "white",
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
          <SafeAreaView style={{ flex: 1 }}>
          <Headers style={{ zIndex: 3 }} headers={headers} onChange={onHeaderChange} />
          <Attachments
            style={{ zIndex: 2 }}
            attachments={attachments}
            onChange={onAttachmentChange}
            onDelete={onAttachmentDelete}
            onSave={onDraftSave}
          />
          <Body style={{ zIndex: 1 }} value={body} onChange={onBodyChange} />
          {!!prevBody && <PrevBody prevBody={prevBody} />}
          </SafeAreaView>
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
  autoFocus
}: React.PropsWithChildren<{ autoFocus?: boolean, style?: ViewStyle; title: string; onChange; forUsers?: boolean; value: any }>) => {
  const headerStyle = {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    borderBottomColor: "#EEEEEE",
    borderBottomWidth: 2,
  } as ViewStyle;

  return (
    <View style={[headerStyle, style]}>
      <Text style={{ color: CommonStyles.lightTextColor }}>{title} : </Text>
      <SearchUserMail selectedUsersOrGroups={value} onChange={val => onChange(val)} autoFocus={autoFocus} />
      {children}
    </View>
  );
};

const HeaderSubject = ({
  style,
  title,
  onChange,
  value,
}: React.PropsWithChildren<{ style?: ViewStyle; title: string; onChange; forUsers?: boolean; value: any }>) => {
  const headerStyle = {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    borderBottomColor: "#EEEEEE",
    borderBottomWidth: 2,
  } as ViewStyle;

  const inputStyle = {
    flex: 1,
    height: 40,
    color: CommonStyles.textColor,
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
      />
    </View>
  );
};

const Headers = ({ style, headers, onChange }) => {
  const [showExtraFields, toggleExtraFields] = React.useState(false);
  const { to, cc, cci, subject } = headers;

  return (
    <View style={[styles.mailPart, style]}>
      <HeaderUsers
        autoFocus
        style={{ zIndex: 4 }}
        value={to}
        onChange={to => onChange({ ...headers, to })}
        title={I18n.t("conversation.to")}>
        <TouchableOpacity onPress={() => toggleExtraFields(!showExtraFields)}>
          <Icon name={showExtraFields ? "keyboard_arrow_up" : "keyboard_arrow_down"} size={28} />
        </TouchableOpacity>
      </HeaderUsers>
      {showExtraFields && (
        <>
          <HeaderUsers
            style={{ zIndex: 3 }}
            title={I18n.t("conversation.cc")}
            value={cc}
            onChange={cc => onChange({ ...headers, cc })}
          />
          <HeaderUsers
            style={{ zIndex: 2 }}
            title={I18n.t("conversation.bcc")}
            value={cci}
            onChange={cci => onChange({ ...headers, cci })}
          />
        </>
      )}
      <HeaderSubject
        title={I18n.t("conversation.subject")}
        value={subject}
        onChange={subject => onChange({ ...headers, subject })}
      />
    </View>
  );
};

const Attachments = ({ style, attachments, onChange, onDelete, onSave }: { style, attachments: IDistantFileWithId[], onChange, onDelete, onSave }) => {
  const removeAttachment = id => {
    const newAttachments = attachments.filter(item => item.id !== id);
    onDelete(id);
    onChange(newAttachments);
  };

  return attachments.length === 0 ? (
    <View />
  ) : (
    <View style={[styles.mailPart, style, { padding: 0 }]}>
      {attachments.map((att) => (
        <Attachment
          id={att.id || att.filename}
          uploadSuccess={!!att.id && onSave()}
          fileType={att.filetype}
          fileName={att.filename}
          onRemove={() => removeAttachment(att.id)}
        />
      ))}
    </View>
  );
};

const Body = ({ style, value, onChange }) => {
  const textUpdateTimeout = React.useRef();
  const [currentValue, updateCurrentValue] = React.useState(value);

  const br2nl = (text: string) => {
    return text?.replace(/<br\/?>/gm, "\n")
      .replace(/<div>\s*?<\/div>/gm, "\n");
  }
  const nl2br = (text: string) => {
    return text?.replace(/\n/gm, "<br>");
  }

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
        placeholder={I18n.t("conversation.typeMessage")}
        textAlignVertical="top"
        multiline
        scrollEnabled={false}
        style={{ flexGrow: 1 }}
        defaultValue={value}
        value={br2nl(currentValue)}
        onChangeText={text => updateCurrentValue(nl2br(text))}
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
