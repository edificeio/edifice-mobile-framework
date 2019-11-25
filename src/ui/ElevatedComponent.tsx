import * as React from "react";
import { CommonStyles } from "../styles/common/styles";
import { ViewStyle, View } from "react-native";

export const elevatedComponentStyle = {
  elevation: CommonStyles.elevation,
  shadowColor: CommonStyles.shadowColor,
  shadowOffset: CommonStyles.shadowOffset,
  shadowOpacity: CommonStyles.shadowOpacity,
  shadowRadius: CommonStyles.shadowRadius,
};

interface IElevatedComponentProps {
    children: React.ReactNode, 
    style?: ViewStyle
}

export const ElevatedComponent: React.FunctionComponent<IElevatedComponentProps> = ({children, style = {}}) => (
    <View style={[elevatedComponentStyle, style]}>
      {children}
    </View>
  );

  export default ElevatedComponent
