import I18n from "i18n-js";
import React from "react";
import { ScrollView, View, StyleSheet, TextInput, ViewStyle } from "react-native";

import { CommonStyles, IOSShadowStyle } from "../../styles/common/styles";
import { Icon, Loading } from "../../ui";
import ConnectionTrackingBar from "../../ui/ConnectionTrackingBar";
import { PageContainer } from "../../ui/ContainerContent";
import TouchableOpacity from "../../ui/CustomTouchableOpacity";
import { Text } from "../../ui/Typography";
import { ISearchUsers } from "../service/newMail";
import Attachment from "./Attachment";
import SearchUserMail from "./SearchUserMail";

type HeadersProps = { to: ISearchUsers; cc: ISearchUsers; bcc: ISearchUsers; subject: string };

interface NewMailComponentProps {
  isFetching: boolean;
  headers: HeadersProps;
  onHeaderChange: (header: Headers) => void;
  body: string;
  onBodyChange: (body: string) => void;
  attachments: any[];
  onAttachmentChange: (attachments: any[]) => void;
}

const styles = StyleSheet.create({
  mailPart: {
    padding: 5,
    backgroundColor: "white",
    elevation: CommonStyles.elevation,
    ...IOSShadowStyle,
  },
});

export default ({
  isFetching,
  headers,
  onHeaderChange,
  body,
  onBodyChange,
  attachments,
  onAttachmentChange,
}: NewMailComponentProps) => {
  return (
    <PageContainer>
      <ConnectionTrackingBar />
      {isFetching ? (
        <Loading />
      ) : (
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} bounces={false} keyboardShouldPersistTaps="never">
          <Headers style={{ zIndex: 3 }} headers={headers} onChange={onHeaderChange} />
          <Attachments style={{ zIndex: 2 }} attachments={attachments} onChange={onAttachmentChange} />
          <Body style={{ zIndex: 1 }} value={body} onChange={onBodyChange} />
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
}: React.PropsWithChildren<{ style?: ViewStyle; title: string; onChange; forUsers?: boolean; value: any }>) => {
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
  value,
}: React.PropsWithChildren<{ style?: ViewStyle; title: string; onChange; forUsers?: boolean; value: any }>) => {
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
      />
    </View>
  );
};

const Headers = ({ style, headers, onChange }) => {
  const [showExtraFields, toggleExtraFields] = React.useState(false);
  const { to, cc, bcc, subject } = headers;

  return (
    <View style={[styles.mailPart, style]}>
      <HeaderUsers
        style={{ zIndex: 4 }}
        value={to}
        onChange={to => onChange({ ...headers, to })}
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
          />
          <HeaderUsers
            style={{ zIndex: 2 }}
            title={I18n.t("zimbra-bcc")}
            value={bcc}
            onChange={bcc => onChange({ ...headers, bcc })}
          />
        </>
      )}
      <HeaderSubject
        title={I18n.t("zimbra-subject")}
        value={subject}
        onChange={subject => onChange({ ...headers, subject })}
      />
    </View>
  );
};

const Attachments = ({ style, attachments, onChange }) => {
  const removeAttachment = id => {
    const newAttachments = attachments.filter(item => item.id !== id);
    onChange(newAttachments);
  };

  return attachments.length === 0 ? (
    <View />
  ) : (
    <View style={[styles.mailPart, style, { padding: 0 }]}>
      {attachments.map(att => (
        <Attachment
          id={att.id || att.filename}
          uploadSuccess={!!att.id}
          fileType={att.contentType}
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
      />
    </View>
  );
};
