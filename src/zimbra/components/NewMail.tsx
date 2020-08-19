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

type NewMailContainerState = {
  showCcRows: boolean;
  mailInfos: IMail;
  subject: string;
  body: string;
};

export default class NewMail extends React.PureComponent<any, NewMailContainerState> {
  constructor(props) {
    super(props);

    const { mail, subject, body } = this.props;
    const bodyText = mail.body && mail.body !== "undefined" ? mail.body.replace("<br>", /\n/g).slice(5, -6) : body;
    this.props.updateStateValue(bodyText);

    this.state = {
      showCcRows: false,
      mailInfos: mail,
      subject: mail.subject !== "undefined" ? mail.subject : subject,
      body: bodyText,
    };
  }

  componentDidUpdate = () => {
    const { mail, subject, body, navigation } = this.props;
    if (mail !== this.state.mailInfos) {
      const bodyText = mail.body && mail.body !== "undefined" ? mail.body.replace("<br>", /\n/g).slice(5, -6) : body;
      this.setState({
        mailInfos: mail,
        subject: mail.subject !== "undefined" ? mail.subject : subject,
        body: bodyText,
      });
      this.props.updateStateValue(bodyText);
    } else if (navigation.state.params.mailId === undefined) this.setState({ subject: "", body: "" });
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
                  defaultValue={this.state.subject}
                  onChangeText={(text: string) => this.props.handleInputChange(text, "subject")}
                />
              </View>
            </View>
            <TextInput
              placeholder={I18n.t("zimbra-type-message")}
              textAlignVertical="top"
              multiline
              style={styles.textZone}
              defaultValue={this.state.body}
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
