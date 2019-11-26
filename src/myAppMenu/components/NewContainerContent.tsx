import style from "glamorous-native";
import { CommonStyles } from "../../styles/common/styles";
import TouchableOpacity from "../../ui/CustomTouchableOpacity";
import { Weight } from "../../ui/Typography";

export const NewListItem = style(TouchableOpacity)(
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

export const NewLeftPanel = style.view({
  justifyContent: "center",
  minHeight: 50,
  width: 50
});

export const NewCenterPanel = style.view({
  alignItems: "flex-start",
  flex: 1,
  justifyContent: "center",
  marginHorizontal: 6,
  padding: 2
});

export const NewRightPanel = style.view({
  alignItems: "center",
  height: 50,
  justifyContent: "space-between",
  width: 50
});

export const NewContent = style.text(
  {
    color: CommonStyles.iconColorOff,
    fontFamily: CommonStyles.primaryFontFamily,
    fontSize: 12,
    fontWeight: Weight.Light,
    marginTop: 10
  },
  ({ nb = 0 }) => ({
    color: nb > 0 ? CommonStyles.textColor : CommonStyles.iconColorOff,
    fontWeight: nb > 0 ? Weight.Normal : Weight.Light
  })
);

export const NewPageContainer = style.view({
  backgroundColor: CommonStyles.lightGrey,
  flex: 1
});
