import * as React from "react";
import { View, StyleSheet, ViewStyle, StyleProp } from "react-native";

import { CommonStyles } from "../../../styles/common/styles";
import TouchableOpacity from "../../../ui/CustomTouchableOpacity";
import { color } from "react-native-reanimated";

const styleConstant = StyleSheet.create({
  
});


export const Dropdown: React.FunctionComponent<any> = (props) => {

  return (
    <TouchableOpacity
      disabled={onPress != null}
      style={[styleConstant.container, selectedStyle, style]}
      onPress={onPress}>
      {children}
    </TouchableOpacity>
  );
};

