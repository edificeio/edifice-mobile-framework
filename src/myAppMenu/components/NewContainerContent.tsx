import style from "glamorous-native";
import { CommonStyles } from "../../styles/common/styles";
import TouchableOpacity from "../../ui/CustomTouchableOpacity";
import { Weight } from "../../ui/Typography";

export const NewListItem = style.view(
  {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 10,
    paddingVertical: 12,
    borderBottomColor: CommonStyles.borderBottomItem,
    flexDirection: "row",
    borderBottomWidth: 1,
    justifyContent: "center"
  },
  ({ highlighted = false }: { highlighted: boolean }) => ({
    backgroundColor: highlighted ? CommonStyles.nonLue : "#FFFFFF",
  })
);

export const NewLeftPanel = style(TouchableOpacity)({
  justifyContent: "center",
  width: 50
});

export const NewCenterPanel = style(TouchableOpacity)({
  alignItems: "flex-start",
  flex: 1,
  justifyContent: "center",
  marginHorizontal: 6,
  padding: 2
});

export const NewRightPanel = style(TouchableOpacity)({
  alignItems: "center",
  justifyContent: "center",
  width: 50
});

export const newContentStyle = {
  color: CommonStyles.iconColorOff,
  fontFamily: CommonStyles.primaryFontFamily,
  fontSize: 12,
  fontWeight: Weight.Light,
  marginTop: 10
}

export const NewContent = style.text(
  newContentStyle,
  ({ nb = 0 }) => ({
    color: nb > 0 ? CommonStyles.textColor : CommonStyles.iconColorOff,
    fontWeight: nb > 0 ? Weight.Normal : Weight.Light
  })
);

export const NewPageContainer = style.view({
  backgroundColor: CommonStyles.lightGrey,
  flex: 1
});
