import { TouchableOpacity, View } from "react-native";
import * as React from "react";
import I18n from "i18n-js";
import { Avatar, Size } from "../../ui/avatars/Avatar";
import { Text, TextBold, TextColor } from "../../ui/text";
import { Icon } from "../../ui/icons/Icon";
import { CommonStyles } from "../../styles/common/styles";
import { IconButton } from "../../ui/IconButton";
import { Loading } from "../../ui/Loading";

export interface IUserCardProps {
  touchable?: boolean;
  id: string;
  displayName: string;
  type: ("Student" | "Relative" | "Teacher" | "Personnel")[] | "Student" | "Relative" | "Teacher" | "Personnel";
  canEdit: boolean;
  hasAvatar: boolean;
  updatingAvatar: boolean;
  onChangeAvatar?: () => void;
  onDeleteAvatar?: () => void;
  onPress?: () => void;
}

export const UserCard = ({
  touchable = false,
  id,
  displayName,
  type,
  canEdit = false,
  hasAvatar,
  updatingAvatar,
  onChangeAvatar,
  onDeleteAvatar,
  onPress = () => {}
} : IUserCardProps) => {
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

  const renderActions = (hasAvatar: boolean, onChangeAvatar, onDeleteAvatar) =>
    <View 
      style={{
        position: "absolute",
        bottom: 0,
        right: 0,
        left: 0,
        flexDirection: "row",
        justifyContent: "space-around"
      }}
    >
      {hasAvatar
        ? <TouchableOpacity onPress={() => onChangeAvatar()}>
            <IconButton
              iconName="pencil"
              iconColor={CommonStyles.white}
              iconSize={15}
              buttonStyle={{backgroundColor: CommonStyles.primary}}
            />
          </TouchableOpacity>
        : <View style={{height: 30, width: 30}}/>
      }
      <TouchableOpacity onPress={() => hasAvatar ? onDeleteAvatar() : onChangeAvatar()}>
        <IconButton
          iconName={hasAvatar ? "trash" : "camera-on"}
          iconColor={CommonStyles.white}
          buttonStyle={{backgroundColor: CommonStyles.primary}}
        />
      </TouchableOpacity>
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
    <View style={{padding: 10, alignItems: "center", justifyContent: "center"}}>
      <Avatar sourceOrId={id} size={Size.verylarge} decorate />
      {canEdit ? renderActions(hasAvatar, onChangeAvatar, onDeleteAvatar) : null}
      {updatingAvatar ? <Loading customColor="white" customStyle={{ position: "absolute", paddingTop: 6, paddingLeft: 3 }}/> : null}
    </View>
    <View
      style={{
        flexGrow: 0,
        flexShrink: 1,
        marginRight: "auto",
        paddingLeft: 15, 
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