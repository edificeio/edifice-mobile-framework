import style from "glamorous-native";
import { CommonStyles } from "../styles/common/styles";
import TouchableOpacity from "./CustomTouchableOpacity";

export const TouchCard = style(TouchableOpacity)({
  backgroundColor: "#FFFFFF",
  paddingHorizontal: 16,
  paddingVertical: 12,
  borderRadius: 10,
  borderBottomColor: CommonStyles.borderBottomItem,
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.3,
  shadowRadius: 1,
  elevation: 1,
  flexDirection: "column"
});

export const Card = style.view({
  backgroundColor: "#FFFFFF",
  paddingHorizontal: 16,
  paddingVertical: 12,
  borderBottomColor: CommonStyles.borderBottomItem,
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.4,
  shadowRadius: 2,
  elevation: 1,
  flexDirection: "column"
});
