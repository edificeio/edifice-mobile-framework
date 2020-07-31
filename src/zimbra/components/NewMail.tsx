import I18n from "i18n-js";
import React from "react";
import { View, StyleSheet } from "react-native";
import { TextInput, TouchableOpacity } from "react-native-gesture-handler";

import { Icon } from "../../ui";
import { PageContainer } from "../../ui/ContainerContent";
import { Text } from "../../ui/Typography";

type NewMailContainerProps = object;

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
            <Text>{I18n.t("zimbra-to")}: </Text>
            <TextInput underlineColorAndroid="lightgrey" style={style.textInput} />
            <TouchableOpacity onPress={this.switchShowCcRows}>
              <Icon
                name={showCcRows ? "keyboard_arrow_up" : "keyboard_arrow_down"}
                size={28}
                style={{ marginHorizontal: 8 }}
              />
            </TouchableOpacity>
          </View>
          {showCcRows && (
            <>
              <View style={style.inputRow}>
                <Text>{I18n.t("zimbra-cc")}: </Text>
                <TextInput underlineColorAndroid="lightgrey" style={style.textInput} />
              </View>
              <View style={style.inputRow}>
                <Text>{I18n.t("zimbra-bcc")}: </Text>
                <TextInput underlineColorAndroid="lightgrey" style={style.textInput} />
              </View>
            </>
          )}
          <View style={style.inputRow}>
            <Text>{I18n.t("zimbra-subject")}: </Text>
            <TextInput underlineColorAndroid="lightgrey" style={style.textInput} />
          </View>
        </View>
        <TextInput
          placeholder={I18n.t("zimbra-type-message")}
          textAlignVertical="top"
          multiline
          style={style.textZone}
        />
      </PageContainer>
    );
  }
}

const style = StyleSheet.create({
  headerView: { backgroundColor: "white", marginBottom: 3 },
  inputRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: 10 },
  textInput: { flexGrow: 1, marginLeft: 10 },
  textZone: { backgroundColor: "white", marginTop: 10, flexGrow: 1, padding: 8 },
});
