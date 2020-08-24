import I18n from "i18n-js";
import React from "react";
import { View, StyleSheet, RefreshControl } from "react-native";
import { TextInput, TouchableOpacity, ScrollView } from "react-native-gesture-handler";

import { CommonStyles } from "../../styles/common/styles";
import { Icon, Loading } from "../../ui";
import { PageContainer } from "../../ui/ContainerContent";
import { Text } from "../../ui/Typography";
import { IMail } from "../state/mailContent";
import SelectMailInfos from "./SelectMailInfos";

type IUserInfos = {
  id: string;
  displayName: string;
}[];

type NewMailContainerState = {
  showCcRows: boolean;
  mailInfos: IMail;
  isPrevBody: Boolean;
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
    if (navigation.state.params.type === "REPLY" || navigation.state.params.type === "REPLY_ALL" || navigation.state.params.type === "FORWARD")
      this.props.updatePrevBody(mail.body && mail.body !== "undefined" ? mail.body.replace(/<br>/g, "\n").slice(5, -6) : body);
    this.props.updateStateValue(toUsers, ccUsers, bccUsers, subjectText, bodyText);

    this.state = {
      showCcRows: false,
      mailInfos: mail,
      isPrevBody: false
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
      if (!this.state.isPrevBody && (navigation.state.params.type === "REPLY" || navigation.state.params.type === "REPLY_ALL" || navigation.state.params.type === "FORWARD")) {
        this.setState({ isPrevBody: true});
        this.props.updatePrevBody(mail.body && mail.body !== "undefined" ? mail.body.replace(/<br>/g, "\n").slice(5, -6) : body);
      }
      this.setState({ mailInfos: mail });
      this.props.updateStateValue(toUsers, ccUsers, bccUsers, subjectText, bodyText);
    }
  };

  renderHiddenCcRows = () => {
    return (
      <>
        <View style={styles.inputRow}>
          <SelectMailInfos
            onPickUser={(user: any) => {
              this.props.pickUser(user, "cc");
            }}
            onUnpickUser={(user: any) => {
              this.props.unpickUser(user, "cc");
            }}
            pickedUsers={this.props.cc}
            remainingUsers={this.props.searchCc}
            onHandleInputChange={this.props.handleInputChange}
            inputName="cc"
          />
        </View>
        <View style={styles.inputRow}>
          <SelectMailInfos
            onPickUser={(user: any) => {
              this.props.pickUser(user, "bcc");
            }}
            onUnpickUser={(user: any) => {
              this.props.unpickUser(user, "bcc");
            }}
            pickedUsers={this.props.bcc}
            remainingUsers={this.props.searchBcc}
            onHandleInputChange={this.props.handleInputChange}
            inputName="bcc"
          />
        </View>
      </>
    );
  };

  switchShowCcRows = () => {
    const { showCcRows } = this.state;
    this.setState({
      showCcRows: !showCcRows,
    });
  };

  refreshMailContent = () => {
    if (this.props.navigation.state.params.mailId !== undefined)
      this.props.fetchMailContentAction(this.props.navigation.state.params.mailId);
  };

  public render() {
    const { showCcRows } = this.state;
    return (
      <PageContainer>
        {this.props.isFetching ? (
          <Loading />
        ) : (
          <ScrollView
            refreshControl={
              <RefreshControl refreshing={this.props.isFetching} onRefresh={() => this.refreshMailContent()} />
            }>
            <View style={styles.headerView}>
              <View style={styles.inputRow}>
                <SelectMailInfos
                  onPickUser={(user: any) => {
                    this.props.pickUser(user, "to");
                  }}
                  onUnpickUser={(user: any) => {
                    this.props.unpickUser(user, "to");
                  }}
                  pickedUsers={this.props.to}
                  remainingUsers={this.props.searchTo}
                  onHandleInputChange={this.props.handleInputChange}
                  inputName="to"
                />
                <TouchableOpacity onPress={this.switchShowCcRows}>
                  <Icon
                    name={showCcRows ? "keyboard_arrow_up" : "keyboard_arrow_down"}
                    size={28}
                    style={{ marginHorizontal: 8, marginTop: 20 }}
                  />
                </TouchableOpacity>
              </View>
              {showCcRows && this.renderHiddenCcRows()}
              <View style={styles.inputRow}>
                <Text style={{ color: CommonStyles.lightTextColor, marginTop: 20 }}>{I18n.t("zimbra-subject")}: </Text>
                <TextInput
                  underlineColorAndroid="lightgrey"
                  style={styles.textInput}
                  defaultValue={this.props.subject}
                  onChangeText={(text: string) => this.props.handleInputChange(text, "subject")}
                />
              </View>
            </View>
            <TextInput
              placeholder={I18n.t("zimbra-type-message")}
              textAlignVertical="top"
              multiline
              style={styles.textZone}
              defaultValue={this.props.body}
              onChangeText={(text: string) => this.props.handleInputChange(text, "body")}
            />
          </ScrollView>
        )}
      </PageContainer>
    );
  }
}

const styles = StyleSheet.create({
  headerView: { backgroundColor: "white", marginBottom: 3 },
  inputRow: { flexDirection: "row", alignItems: "flex-start", paddingHorizontal: 10 },
  textInput: { flexGrow: 1, marginLeft: 10 },
  textZone: { marginTop: 10, flexGrow: 1, padding: 8 },
});
