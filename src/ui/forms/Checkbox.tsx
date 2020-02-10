import style from "glamorous-native";
import * as React from "react";
import { CommonStyles } from "../../styles/common/styles";
import TouchableOpacity from "../../ui/CustomTouchableOpacity";
import { Icon } from "..";

const TapCircle = style(TouchableOpacity)(
  {
    alignItems: "center",
    borderRadius: 14,
    height: 25,
    justifyContent: "center",
    width: 25,
  },
  ({ checked = false }) => ({
    backgroundColor: checked ? CommonStyles.primary : "#FFFFFF",
    borderColor: checked ? CommonStyles.primary : "#DDDDDD",
    borderWidth: checked ? 0 : 2,
  })
);

export const Checkbox = ({
  checked,
  onUncheck,
  onCheck,
}: {
  checked: boolean;
  onUncheck?: () => void;
  onCheck?: () => void;
}) => (
  <TapCircle onPress={() => (checked ? onUncheck && onUncheck() : onCheck && onCheck())} checked={checked}>
    <Icon size={17} name="checked" color="white" />
  </TapCircle>
);
