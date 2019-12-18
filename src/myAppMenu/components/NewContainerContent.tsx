import style from "glamorous-native";
import { CommonStyles } from "../../styles/common/styles";
import TouchableOpacity from "../../ui/CustomTouchableOpacity";
import { Weight } from "../../ui/Typography";

export const ListItem = style.view(
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

export const LeftPanel = style(TouchableOpacity)({
  justifyContent: "center",
  width: 50,
  height: 66,
});

export const CenterPanel = style(TouchableOpacity)({
  alignItems: "flex-start",
  flex: 1,
  justifyContent: "center",
  marginHorizontal: 6,
  padding: 2
});

export const RightPanel = style(TouchableOpacity)({
  alignItems: "center",
  justifyContent: "center",
  width: 50
});

export const contentStyle = {
  color: CommonStyles.iconColorOff,
  fontFamily: CommonStyles.primaryFontFamily,
  fontSize: 12,
  fontWeight: Weight.Light,
  marginTop: 10
}

export const Content = style.text(
  contentStyle,
  ({ nb = 0 }) => ({
    color: nb > 0 ? CommonStyles.textColor : CommonStyles.iconColorOff,
    fontWeight: nb > 0 ? Weight.Normal : Weight.Light
  })
);

export const PageContainer = style.view({
  backgroundColor: CommonStyles.lightGrey,
  flex: 1
});
