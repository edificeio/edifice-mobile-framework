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
import HtmlToText from "../../infra/htmlConverter/text";

export interface INotificationItemProps extends INotification {
  onPress: (id: string) => void;
}

const getAppInfos: {
  [key: string]: { name: string; icon: string; color: string; }
} = {
  "ARCHIVE": { name: "Mes données", icon: "icon-notif-on", color: CommonStyles.themeOpenEnt.yellow},
  "BLOG": { name: "Blog", icon: "icon-notif-on", color: CommonStyles.themeOpenEnt.indigo},
  "CALENDAR": { name: "Agenda", icon: "icon-notif-on", color: CommonStyles.themeOpenEnt.yellow},
  "COLLABORATIVEEDITOR": { name: "Pad", icon: "icon-notif-on", color: CommonStyles.themeOpenEnt.cyan},
  "COLLABORATIVEWALL": { name: "Mur Collaboratif", icon: "icon-notif-on", color: CommonStyles.themeOpenEnt.green},
  "COMMUNITY": { name: "Communautés", icon: "icon-notif-on", color: CommonStyles.themeOpenEnt.purple},
  "EXERCIZER": { name: "Exercices et évaluations", icon: "icon-notif-on", color: CommonStyles.themeOpenEnt.purple},
  "FORUM": { name: "Forum", icon: "icon-notif-on", color: CommonStyles.themeOpenEnt.cyan},
  "HOMEWORKS": { name: "Cahier de textes", icon: "icon-notif-on", color: CommonStyles.themeOpenEnt.cyan},
  "MESSAGERIE": { name: "Messagerie", icon: "icon-notif-on", color: CommonStyles.themeOpenEnt.yellow},
  "MINDMAP": { name: "Carte mentale", icon: "icon-notif-on", color: CommonStyles.themeOpenEnt.cyan},
  "NEWS": { name: "Actualités", icon: "icon-notif-on", color: CommonStyles.themeOpenEnt.cyan},
  "PAGES": { name: "Pages", icon: "icon-notif-on", color: CommonStyles.themeOpenEnt.red},
  "POLL": { name: "Sondage", icon: "icon-notif-on", color: CommonStyles.themeOpenEnt.cyan},
  "RACK": { name: "Casier", icon: "icon-notif-on", color: CommonStyles.themeOpenEnt.red},
  "RBS": { name: "Réservation de ressources", icon: "icon-notif-on", color: CommonStyles.themeOpenEnt.pink},
  "SCHOOLBOOK": { name: "Carnet de liaison", icon: "icon-notif-on", color: CommonStyles.themeOpenEnt.green},
  "SCRAPBOOK": { name: "Cahier multimédia", icon: "icon-notif-on", color: CommonStyles.themeOpenEnt.green},
  "SHAREBIGFILES": { name: "Partage de fichiers lourds", icon: "icon-notif-on", color: CommonStyles.themeOpenEnt.purple},
  "SUPPORT": { name: "Aide et support", icon: "icon-notif-on", color: CommonStyles.themeOpenEnt.green},
  "TIMELINE": { name: "Fil de nouveautés", icon: "", color: CommonStyles.themeOpenEnt.indigo},
  "TIMELINEGENERATOR": { name: "Frise chronologique", icon: "icon-notif-on", color: CommonStyles.themeOpenEnt.yellow},
  "USERBOOK": { name: "Annuaire", icon: "icon-notif-on", color: CommonStyles.themeOpenEnt.green},
  "WIKI": { name: "Wiki", icon: "icon-notif-on", color: CommonStyles.themeOpenEnt.purple},
  "WORKSPACE": { name: "Espace documentaire", icon: "icon-notif-on", color: CommonStyles.themeOpenEnt.red},
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
  unread = false,
  onPress,
}: INotificationItemProps) => {
  const formattedContent = HtmlToText(message, true).render.replace(params.username, "").trim();
  return (
    <NewListItem nb={unread} onPress={() => onPress(id)}>
      <NewLeftPanel>
        <BadgeAvatar
          avatars={[sender || require("../../../assets/images/system-avatar.png")]}
          badgeContent={getAppInfos[type] && getAppInfos[type].icon}
          badgeColor={getAppInfos[type] && getAppInfos[type].color}
        />
      </NewLeftPanel>
      <NewCenterPanel>
        <Author nb={unread} numberOfLines={1}>
          {params && params.username || getAppInfos[type] && getAppInfos[type].name}
        </Author>
        {message && message.length ? (
          <NewContent nb={unread} numberOfLines={2}>
            {formattedContent}
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
