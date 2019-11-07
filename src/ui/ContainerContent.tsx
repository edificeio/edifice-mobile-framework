import style from "glamorous-native";
import { CommonStyles } from "../styles/common/styles";
import TouchableOpacity from "../ui/CustomTouchableOpacity";
import { Weight } from "./Typography";
import { layoutSize } from "../styles/common/layoutSize";

export const ArticleContainer = style.view({
  paddingTop: 5,
  paddingBottom: 5,
  flex: 1,
  flexDirection: "column",
  flexWrap: "wrap"
});

export const ListItem = style(TouchableOpacity)(
  {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomColor: CommonStyles.borderBottomItem,
    flexDirection: "row"
  },
  ({ borderBottomWidth = 1, full = false, nb = 0 }) => ({
    borderLeftWidth: full ? 4 : 0,
    borderLeftColor: full ? CommonStyles.hightlightColor : "transparent",
    backgroundColor: nb > 0 ? CommonStyles.nonLue : "#FFFFFF",
    borderBottomWidth
  })
);

export const Header = style.view({
  alignItems: "stretch",
  flexDirection: "row",
  justifyContent: "flex-start",
  marginBottom: 6,
  minHeight: layoutSize.LAYOUT_50,
  width: "100%"
});

export const LeftPanel = style.view({
  justifyContent: "center",
  minHeight: layoutSize.LAYOUT_50,
  width: layoutSize.LAYOUT_50
});

export const LeftIconPanel = style.view({
  justifyContent: "center",
  alignItems: 'center',
  minHeight: layoutSize.LAYOUT_54,
  width: layoutSize.LAYOUT_50,
  margin: 0,
  marginRight: layoutSize.LAYOUT_10
});

export const CenterPanel = style.view({
  alignItems: "flex-start",
  flex: 1,
  justifyContent: "center",
  marginHorizontal: 6,
  padding: 2
});

export const RightPanel = style.view({
  alignItems: "center",
  height: layoutSize.LAYOUT_50,
  justifyContent: "flex-end",
  width: layoutSize.LAYOUT_50
});

export const Content = style.text(
  {
    color: CommonStyles.iconColorOff,
    fontFamily: CommonStyles.primaryFontFamily,
    fontSize: layoutSize.LAYOUT_12,
    fontWeight: Weight.Light,
    marginTop: 10
  },
  ({ nb = 0 }) => ({
    color: nb > 0 ? CommonStyles.textColor : CommonStyles.iconColorOff,
    fontWeight: nb > 0 ? Weight.Normal : Weight.Light
  })
);

export const PageContainer = style.view({
  backgroundColor: CommonStyles.lightGrey,
  flex: 1
});
