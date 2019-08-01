import { TouchableOpacity, View } from "react-native";
import * as React from "react";
import I18n from "i18n-js";
import { Avatar, Size } from "../../ui/avatars/Avatar";
import { Text, TextBold, TextColor, rem } from "../../ui/text";
import { Icon } from "../../ui/icons/Icon";
import { CommonStyles } from "../../styles/common/styles";

export interface IUserCardProps {
  touchable?: boolean;
  onPress?: () => void;
  id: string;
  displayName: string;
  type: ("Student" | "Relative" | "Teacher" | "Personnel")[] | "Student" | "Relative" | "Teacher" | "Personnel";
}

export const UserCard = ({id, displayName, type, touchable = false, onPress = () => {} } : IUserCardProps) => {
  const WrapperComponent = touchable ? TouchableOpacity : View;

  const renderUserType = (type: "Student" | "Relative" | "Teacher" | "Personnel") => <View style={{
    flexDirection: "row",
    alignItems: "center"
  }}>
    <View style={{
      width: 6, height: 6, borderRadius: 3, marginRight: 4,
      backgroundColor: CommonStyles.profileTypes[type] || CommonStyles.lightGrey
    }}
    key={type}></View>
    <Text color={TextColor.Light} fontSize={12}>{I18n.t(`profileTypes.${type}`)}</Text>
  </View>;

  return <WrapperComponent
    style={{
      alignItems: "center",
      backgroundColor: "white",
      flex: 0,
      flexDirection: "row",
      flexGrow: 0,
      justifyContent: "flex-start",
      padding: 15,
      width: "100%",
      borderBottomWidth: 1,
      borderColor: "#ddd"
    }}
    onPress={onPress}>
    <View style={{ margin: 10, paddingRight: 15 }}>
      <Avatar id={id} size={Size.verylarge} decorate />
    </View>
    <View
      style={{
        flexGrow: 0,
        flexShrink: 1,
        marginRight: "auto"
      }}
    >
      <TextBold>
        {displayName}
      </TextBold>
      {Array.isArray(type) ? type.map(item => renderUserType(item)) : renderUserType(type)}
    </View>
    {touchable ? <Icon
      name="arrow_down"
      color={"#868CA0"}
      style={{ transform: [{ rotate: "270deg" }] }}
    /> : undefined }
  </WrapperComponent>;
};