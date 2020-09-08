import I18n from "i18n-js";
import React from "react";
import { ScrollView, View, StyleSheet, TextInput } from "react-native";

import { CommonStyles, IOSShadowStyle } from "../../styles/common/styles";
import { Icon } from "../../ui";
import TouchableOpacity from "../../ui/CustomTouchableOpacity";
import { Text } from "../../ui/Typography";
import { IMail } from "../state/mailContent";
import SelectMailInfos from "./SelectMailInfos";

type IUserInfos = {
  id: string;
  displayName: string;
}[];

type NewMailContainerState = {
  mailInfos: IMail;
  isPrevBody: boolean;
};

export default class NewMail extends React.PureComponent<any, NewMailContainerState> {
  updateRecipients = (key, mail, recipient) => {
    const { navigation } = this.props;
    let users = [] as IUserInfos;
    if (navigation.state.params.type === "FORWARD") return recipient;
    else if (navigation.state.params.type === "REPLY" && key !== "to") return users;
    if (mail[key] !== undefined && mail[key].length > 0) {
      mail[key].map(userId => {
        users.push({ id: userId, displayName: mail.displayNames.find(item => item[0] === userId)[1] });
      });
    } else users = recipient;
    return users;
  };

  constructor(props) {
    super(props);

    const { mail, to, cc, bcc, subject, body, navigation } = this.props;
    const toUsers = this.updateRecipients("to", mail, to);
    const ccUsers = this.updateRecipients("cc", mail, cc);
    const bccUsers = this.updateRecipients("bcc", mail, bcc);
    let bodyText = body;
    let subjectText = mail.subject && mail.subject !== "undefined" ? mail.subject : subject;
    if (navigation.state.params.type === "REPLY" || navigation.state.params.type === "REPLY_ALL")
      subjectText = `${I18n.t("zimbra-reply-subject")} ${subject}`;
    else if (navigation.state.params.type === "FORWARD") subjectText = `${I18n.t("zimbra-forward-subject")} ${subject}`;
    else if (navigation.state.params.type === "DRAFT")
      bodyText = mail.body && mail.body !== "undefined" ? mail.body.replace(/<br>/g, "\n").slice(5, -6) : body;
    if (
      navigation.state.params.type === "REPLY" ||
      navigation.state.params.type === "REPLY_ALL" ||
      navigation.state.params.type === "FORWARD"
    )
      this.props.updatePrevBody(
        mail.body && mail.body !== "undefined" ? mail.body.replace(/<br>/g, "\n").slice(5, -6) : body
      );
    this.props.updateStateValue(toUsers, ccUsers, bccUsers, subjectText, bodyText);

    this.state = {
      mailInfos: mail,
      isPrevBody: false,
    };
  }

  componentDidUpdate = () => {
    const { mail, to, cc, bcc, subject, body, navigation } = this.props;
    if (mail !== this.state.mailInfos) {
      const toUsers = this.updateRecipients("to", mail, to);
      const ccUsers = this.updateRecipients("cc", mail, cc);
      const bccUsers = this.updateRecipients("bcc", mail, bcc);
      let bodyText = body;
      let subjectText = mail.subject && mail.subject !== "undefined" ? mail.subject : subject;
      if (navigation.state.params.type === "REPLY" || navigation.state.params.type === "REPLY_ALL")
        subjectText = mail.subject !== subject ? `${I18n.t("zimbra-reply-subject")} ${mail.subject}` : subject;
      else if (navigation.state.params.type === "FORWARD")
        subjectText = mail.subject !== subject ? `${I18n.t("zimbra-forward-subject")} ${mail.subject}` : subject;
      else if (navigation.state.params.type === "DRAFT") {
        bodyText = mail.body && mail.body !== "undefined" ? mail.body.replace(/<br>/g, "\n").slice(5, -6) : body;
        subjectText = mail.subject && mail.subject !== "undefined" ? mail.subject : subject;
      }
      if (
        !this.state.isPrevBody &&
        (navigation.state.params.type === "REPLY" ||
          navigation.state.params.type === "REPLY_ALL" ||
          navigation.state.params.type === "FORWARD")
      ) {
        this.setState({ isPrevBody: true });
        this.props.updatePrevBody(
          mail.body && mail.body !== "undefined" ? mail.body.replace(/<br>/g, "\n").slice(5, -6) : body
        );
      }
      this.setState({ mailInfos: mail });
      this.props.updateStateValue(toUsers, ccUsers, bccUsers, subjectText, bodyText);
    }
  };

  public render() {
    const { attachments, id } = this.props.mail;
    const {
      deleteAttachment,
      pickUser,
      unpickUser,
      to,
      searchTo,
      cc,
      searchCc,
      bcc,
      searchBcc,
      subject,
      handleInputChange,
    } = this.props;
    return (
      <ScrollView bounces={false} contentContainerStyle={{ flexGrow: 1 }}>
        <Headers
          style={{ zIndex: 3 }}
          pickUser={pickUser}
          unpickUser={unpickUser}
          to={to}
          searchTo={searchTo}
          cc={cc}
          searchCc={searchCc}
          bcc={bcc}
          searchBcc={searchBcc}
          subject={subject}
          handleInputChange={handleInputChange}
        />
        <Attachments style={{ zIndex: 2 }} attachments={attachments} deleteAttachment={deleteAttachment} id={id} />
        <View style={[styles.mailPart, { zIndex: 1, flexGrow: 1 }]}>
          <TextInput
            placeholder={I18n.t("zimbra-type-message")}
            textAlignVertical="top"
            multiline
            scrollEnabled={false}
            style={{ flexGrow: 1 }}
            defaultValue={this.props.body}
            onChangeText={(text: string) => this.props.handleInputChange(text, "body")}
          />
        </View>
      </ScrollView>
    );
  }
}

const Headers = ({
  style,
  pickUser,
  unpickUser,
  to,
  searchTo,
  cc,
  searchCc,
  bcc,
  searchBcc,
  subject,
  handleInputChange,
}) => {
  const [showExtraFields, toggleExtraFields] = React.useState(false);

  return (
    <View style={[styles.mailPart, style]}>
      <HeaderLine title={I18n.t("zimbra-to")}>
        <SelectMailInfos
          onPickUser={(user: any) => {
            pickUser(user, "to");
          }}
          onUnpickUser={(user: any) => {
            unpickUser(user, "to");
          }}
          pickedUsers={to}
          remainingUsers={searchTo}
          onHandleInputChange={handleInputChange}
          inputName="to"
        />
        <TouchableOpacity onPress={() => toggleExtraFields(!showExtraFields)}>
          <Icon name={showExtraFields ? "keyboard_arrow_up" : "keyboard_arrow_down"} size={28} />
        </TouchableOpacity>
      </HeaderLine>
      {showExtraFields && (
        <>
          <HeaderLine title={I18n.t("zimbra-cc")}>
            <SelectMailInfos
              onPickUser={(user: any) => {
                pickUser(user, "cc");
              }}
              onUnpickUser={(user: any) => {
                unpickUser(user, "cc");
              }}
              pickedUsers={cc}
              remainingUsers={searchCc}
              onHandleInputChange={handleInputChange}
              inputName="cc"
            />
          </HeaderLine>
          <HeaderLine title={I18n.t("zimbra-bcc")}>
            <SelectMailInfos
              onPickUser={(user: any) => {
                pickUser(user, "bcc");
              }}
              onUnpickUser={(user: any) => {
                unpickUser(user, "bcc");
              }}
              pickedUsers={bcc}
              remainingUsers={searchBcc}
              onHandleInputChange={handleInputChange}
              inputName="bcc"
            />
          </HeaderLine>
        </>
      )}
      <HeaderLine title={I18n.t("zimbra-subject")}>
        <TextInput
          style={styles.textInput}
          defaultValue={subject}
          onChangeText={(text: string) => handleInputChange(text, "subject")}
        />
      </HeaderLine>
    </View>
  );
};

const HeaderLine = ({ title, children }) => (
  <View style={styles.inputRow}>
    <Text style={{ color: CommonStyles.lightTextColor }}>{title} : </Text>
    {children}
  </View>
);

const Attachments = ({ style, attachments, deleteAttachment, id }) => (
  <>
    {attachments ? (
      <View style={[styles.mailPart, style]}>
        {attachments.map(att => (
          <View style={styles.PJitem}>
            <Text>{att.filename}</Text>
            <TouchableOpacity onPress={() => deleteAttachment(id, att.id)}>
              <Icon name="close" color="red" />
            </TouchableOpacity>
          </View>
        ))}
      </View>
    ) : (
      <View />
    )}
  </>
);

const styles = StyleSheet.create({
  mailPart: { padding: 5, backgroundColor: "white", elevation: CommonStyles.elevation, ...IOSShadowStyle },
  inputRow: { flexDirection: "row", alignItems: "center", marginVertical: 5, paddingHorizontal: 10 },
  textInput: {
    flex: 1,
    height: 40,
    color: CommonStyles.textColor,
    borderBottomColor: "#EEEEEE",
    borderBottomWidth: 2,
  },
  PJitem: {
    margin: 5,
    padding: 5,
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: CommonStyles.lightGrey,
    alignItems: "center",
    elevation: CommonStyles.elevation,
    ...IOSShadowStyle,
  },
});
