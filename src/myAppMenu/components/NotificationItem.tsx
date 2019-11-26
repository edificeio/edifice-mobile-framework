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
import { INotification } from "../reducers/notificationList";
import { Icon } from "../../ui/icons/Icon";

export interface INotificationItemProps extends INotification {
  //TODO: params?
  onPress: (id: string) => void;
}
//TODO: improve logic (/eventType or type?)
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
  date,
  eventType,
  message,
  params,
  recipients,
  resource,
  sender,
  type,
  //TODO: unread?
  unread = false,
  onPress,
}: INotificationItemProps) => {
  return (
    //TODO: handle "NEW" items
    <NewListItem nb={unread} onPress={() => onPress(id)}>
      <NewLeftPanel>
        <BadgeAvatar
          //TODO: put real avatar
          avatars={[""]}
          badgeContent={getNotificationBadgeInfos(type).name}
          badgeColor={getNotificationBadgeInfos(type).color}
        />
      </NewLeftPanel>
      <NewCenterPanel>
        <Author nb={unread} numberOfLines={1}>
            {params && params.username || I18n.t("unknown-user")}
        </Author>
        {message && message.length ? (
          <NewContent nb={unread} numberOfLines={2}>
            {/* TODO: convert html */}
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
