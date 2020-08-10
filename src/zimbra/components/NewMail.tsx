import I18n from "i18n-js";
import React from "react";
import { View, StyleSheet } from "react-native";
import { TextInput, TouchableOpacity } from "react-native-gesture-handler";

import { CommonStyles } from "../../styles/common/styles";
import { Icon } from "../../ui";
import { PageContainer } from "../../ui/ContainerContent";
import { Text } from "../../ui/Typography";
import { ISearchUsers } from "../service/newMail";

type NewMailContainerProps = {
  to: ISearchUsers;
  cc: ISearchUsers;
  bcc: ISearchUsers;
  subject: string;
  body: string;
  attachments: string[];
  handleInputChange: any;
};

type NewMailContainerState = {
  showCcRows: boolean;
};

export default class NewMail extends React.PureComponent<NewMailContainerProps, NewMailContainerState> {
  constructor(props) {
    super(props);
    this.state = {
      showCcRows: false,
    };
  }

  renderUsersSearch = inputName => {
    let inputNameProps: ISearchUsers;
    switch (inputName) {
      case "to":
        inputNameProps = this.props.to;
        break;
      case "cc":
        inputNameProps = this.props.cc;
        break;
      case "bcc":
        inputNameProps = this.props.bcc;
        break;
      default:
        return;
    }
    return (
      <View style={[style.shadow, { flexDirection: "column" }]}>
        {inputNameProps.map(person => (
          <View style={{ flexDirection: "row", marginBottom: 5 }}>
            <View style={[style.dotReceiverColor, { backgroundColor: "orange" }]} />
            <Text>{person.displayName}</Text>
          </View>
        ))}
      </View>
    );
  };

  switchShowCcRows = () => {
    const { showCcRows } = this.state;
    this.setState({
      showCcRows: !showCcRows,
    });
  };

  public render() {
    const { showCcRows } = this.state;
    return (
      <PageContainer>
        <View style={style.headerView}>
          <View style={style.inputRow}>
            <Text style={{ marginTop: 20 }}>{I18n.t("zimbra-to")}: </Text>
            <View style={style.textInput}>
              <TextInput
                underlineColorAndroid="lightgrey"
                onChangeText={(text: string) => this.props.handleInputChange(text, "to")}
              />
              {this.props.to.length > 0 && this.renderUsersSearch("to")}
            </View>
            <TouchableOpacity onPress={this.switchShowCcRows}>
              <Icon
                name={showCcRows ? "keyboard_arrow_up" : "keyboard_arrow_down"}
                size={28}
                style={{ marginHorizontal: 8, marginTop: 20 }}
              />
            </TouchableOpacity>
          </View>
          {showCcRows && (
            <>
              <View style={style.inputRow}>
                <Text>{I18n.t("zimbra-cc")}: </Text>
                <TextInput
                  underlineColorAndroid="lightgrey"
                  style={style.textInput}
                  onChangeText={(text: string) => this.props.handleInputChange(text, "cc")}
                />
              </View>
              <View style={style.inputRow}>
                <Text>{I18n.t("zimbra-bcc")}: </Text>
                <TextInput
                  underlineColorAndroid="lightgrey"
                  style={style.textInput}
                  onChangeText={(text: string) => this.props.handleInputChange(text, "bcc")}
                />
              </View>
            </>
          )}
          <View style={style.inputRow}>
            <Text>{I18n.t("zimbra-subject")}: </Text>
            <TextInput
              underlineColorAndroid="lightgrey"
              style={style.textInput}
              onChangeText={(text: string) => this.props.handleInputChange(text, "subject")}
            />
          </View>
        </View>
        <TextInput
          placeholder={I18n.t("zimbra-type-message")}
          textAlignVertical="top"
          multiline
          style={style.textZone}
          onChangeText={(text: string) => this.props.handleInputChange(text, "body")}
        />
      </PageContainer>
    );
  }
}

const style = StyleSheet.create({
  headerView: { backgroundColor: "white", marginBottom: 3 },
  inputRow: { flexDirection: "row", alignItems: "flex-start", paddingHorizontal: 10 },
  textInput: { flexGrow: 1, marginLeft: 10 },
  textZone: { backgroundColor: "white", marginTop: 10, flexGrow: 1, padding: 8 },
  dotReceiverColor: { width: 8, height: 8, borderRadius: 15, marginTop: 6, marginRight: 5 },
  shadow: {
    elevation: 4,
    shadowColor: CommonStyles.shadowColor,
    shadowOffset: CommonStyles.shadowOffset,
    shadowOpacity: CommonStyles.shadowOpacity,
    shadowRadius: CommonStyles.shadowRadius,
  },
});
