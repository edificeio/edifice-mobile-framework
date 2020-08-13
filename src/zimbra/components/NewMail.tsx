import I18n from "i18n-js";
import React from "react";
import { View, StyleSheet } from "react-native";
import { TextInput, TouchableOpacity } from "react-native-gesture-handler";

import { CommonStyles } from "../../styles/common/styles";
import { Icon } from "../../ui";
import { PageContainer } from "../../ui/ContainerContent";
import { Text } from "../../ui/Typography";
import { ISearchUsers } from "../service/newMail";
import SelectMailInfos from "./SelectMailInfos";

type NewMailContainerProps = {
  to: ISearchUsers;
  cc: ISearchUsers;
  bcc: ISearchUsers;
  subject: string;
  body: string;
  attachments: string[];
  searchTo: ISearchUsers;
  searchCc: ISearchUsers;
  searchBcc: ISearchUsers;
  handleInputChange: any;
  pickUser: any;
  unpickUser: any;
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

  public render() {
    const { showCcRows } = this.state;
    return (
      <PageContainer>
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
              onChangeText={(text: string) => this.props.handleInputChange(text, "subject")}
            />
          </View>
        </View>
        <TextInput
          placeholder={I18n.t("zimbra-type-message")}
          textAlignVertical="top"
          multiline
          style={styles.textZone}
          onChangeText={(text: string) => this.props.handleInputChange(text, "body")}
        />
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
