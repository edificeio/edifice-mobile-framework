import { ViewStyle } from "react-native";
import style from "glamorous-native";
import { CommonStyles } from "../styles/common/styles";

export const BubbleStyle = style.view(
  {
    alignSelf: "stretch",
    elevation: 2,
    justifyContent: "center",
    marginBottom: 10,
    marginTop: 6,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: CommonStyles.shadowColor,
    shadowOffset: CommonStyles.shadowOffset,
    shadowOpacity: CommonStyles.shadowOpacity,
    shadowRadius: CommonStyles.shadowRadius
  },
  ({ my, style }): ViewStyle => ({
    backgroundColor: my ? CommonStyles.iconColorOn : "white",
    ...style
  })
);

export const BubbleScrollStyle = style.scrollView(
  {
    alignSelf: "stretch",
    elevation: 2,
    justifyContent: "center",
    marginBottom: 10,
    marginTop: 6,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: CommonStyles.shadowColor,
    shadowOffset: CommonStyles.shadowOffset,
    shadowOpacity: CommonStyles.shadowOpacity,
    shadowRadius: CommonStyles.shadowRadius
  },
  ({ my, style }): ViewStyle => ({
    backgroundColor: my ? CommonStyles.iconColorOn : "white",
    ...style
  })
);