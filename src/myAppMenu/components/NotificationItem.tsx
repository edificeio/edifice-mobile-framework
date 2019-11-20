import style from "glamorous-native";
import I18n from "i18n-js";
import * as React from "react";

import { BadgeAvatar } from "../../ui/BadgeAvatar";
import {
  NewListItem,
  NewLeftPanel,
  NewCenterPanel,
  NewRightPanel,
  NewContent
} from "./NewContainerContent";
import { DateView } from "../../ui/DateView";

import { CommonStyles } from "../../styles/common/styles";

import { FontWeight } from "../../ui/text";
//import { IConversationThread } from "../reducers/threadList";
import { Icon } from "../../ui/icons/Icon";

export interface INotificationItemProps extends IConversationThread {
  onPress: (id: string, displayNames: string[][], message: string) => void;
}

const getNotificationBadgeInfos = (notificationType: string) => {
  switch (notificationType) {
    case "stop":
        return { name: "close", color: CommonStyles.error}
    case "bell":
      return { name: "icon-notif-on", color: CommonStyles.primary}
    default:
      return {};
  }
}

export default ({
  id,
  message = "Ceci est une notification et sa description qui décrit son contenu et l'affiche sur l'écran de l'utilisateur",
  type = "stop",
  displayName = "Jean Loic",
  date,
  unread,
  onPress,
  ...others
}: INotificationItemProps) => {
  return (
    <NewListItem nb={unread} onPress={() => onPress()}>
      <NewLeftPanel>
        <BadgeAvatar
          avatars={[""]}
          badgeContent={getNotificationBadgeInfos(type).name}
          badgeColor={getNotificationBadgeInfos(type).color}
        />
      </NewLeftPanel>
      <NewCenterPanel>
        <Author nb={unread} numberOfLines={1}>
            {displayName || I18n.t("unknown-user")}
        </Author>
        {message && message.length ? (
          <NewContent nb={unread} numberOfLines={2}>
            {message}
          </NewContent>
        ) : (
          <style.View />
        )}
      </NewCenterPanel>
      <NewRightPanel>
        <DateView date={date} strong={unread > 0} />
        <Icon
          name="arrow_down"
          color={"#868CA0"}
          style={{ transform: [{ rotate: "270deg" }] }}
        />
      </NewRightPanel>
    </NewListItem>
  );
};

const Author = style.text(
  {
    color: CommonStyles.textColor,
    fontFamily: CommonStyles.primaryFontFamily,
    fontSize: 14
  },
  ({ nb }) => ({
    fontWeight: nb > 0 ? FontWeight.SemiBold : FontWeight.Normal
  })
);
