import * as React from "react";
import { Text, View } from "react-native";
import { ButtonLine } from "../ButtonLine";
import { ButtonsOkCancel } from "../ButtonsOkCancel";
import { ButtonTextIcon } from "../ButtonTextIcon";
import { FlatButton } from "../FlatButton";

/**
 * UiButtons
 * Ui showcase set showing all buttons possibles.
 */
export default () => (
  <View>
    <Text>Ui Buttons</Text>
    <ButtonLine title="ButtonLine" onPress={() => true} />
    <ButtonsOkCancel
      title="ButtonsOkCancel"
      onValid={() => true}
      onCancel={() => true}
    />
    <ButtonTextIcon
      leftName="search"
      rightName="send_icon"
      title="ButtonTextIcon"
      onPress={() => true}
    />
    <FlatButton
      leftName="search"
      rightName="send_icon"
      title="FlatButton"
      loading={false}
    />
  </View>
);