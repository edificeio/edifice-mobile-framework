/**
 * Information about a post. Displayed just before a notification in timeline.
 */
import * as React from "react";
import { Text } from "react-native";
import I18n from "i18n-js";
import moment from "moment";

import { CenterPanel, Header, LeftPanel } from "../../ui/ContainerContent";
import { Light } from "../../ui/Typography";
import { CommonStyles } from "../../styles/common/styles";
import { getSessionInfo } from "../../App";
import { TextColorStyle } from "../../framework/components/text";
import { BadgeAvatar } from "../../ui/BadgeAvatar";
import { HtmlContentView } from "../../ui/HtmlContentView";

const getAppInfos: {
  [key: string]: { name: string; icon: string; color: string; }
} = {
  "ARCHIVE": { name: "Mes données", icon: "file-archive", color: CommonStyles.themeOpenEnt.yellow },
  "BLOG": { name: "Blog", icon: "bullhorn", color: CommonStyles.themeOpenEnt.indigo },
  "CALENDAR": { name: "Agenda", icon: "calendar", color: CommonStyles.themeOpenEnt.yellow },
  "COLLABORATIVEEDITOR": { name: "Pad", icon: "pad1-1", color: CommonStyles.themeOpenEnt.cyan },
  "COLLABORATIVEWALL": { name: "Mur Collaboratif", icon: "slideshare", color: CommonStyles.themeOpenEnt.green },
  "COMMUNITY": { name: "Communautés", icon: "share", color: CommonStyles.themeOpenEnt.purple },
  "EXERCIZER": { name: "Exercices et évaluations", icon: "cubes", color: CommonStyles.themeOpenEnt.purple },
  "FORUM": { name: "Forum", icon: "chat2", color: CommonStyles.themeOpenEnt.cyan },
  "HOMEWORKS": { name: "Cahier de textes", icon: "book-alt", color: CommonStyles.themeOpenEnt.cyan },
  "MESSAGERIE": { name: "Messagerie", icon: "mail", color: CommonStyles.themeOpenEnt.yellow },
  "MINDMAP": { name: "Carte mentale", icon: "sitemap", color: CommonStyles.themeOpenEnt.cyan },
  "NEWS": { name: "Actualités", icon: "newspaper", color: CommonStyles.themeOpenEnt.cyan },
  "PAGES": { name: "Pages", icon: "website", color: CommonStyles.themeOpenEnt.red },
  "POLL": { name: "Sondage", icon: "check-1", color: CommonStyles.themeOpenEnt.cyan },
  "RACK": { name: "Casier", icon: "inbox-1", color: CommonStyles.themeOpenEnt.red },
  "RBS": { name: "Réservation de ressources", icon: "reservation", color: CommonStyles.themeOpenEnt.pink },
  "SCHOOLBOOK": { name: "Carnet de liaison", icon: "icon-notif-on", color: CommonStyles.themeOpenEnt.green },
  "SCRAPBOOK": { name: "Cahier multimédia", icon: "scrapbook", color: CommonStyles.themeOpenEnt.green },
  "SHAREBIGFILES": { name: "Partage de fichiers lourds", icon: "bigfiles", color: CommonStyles.themeOpenEnt.purple },
  "SUPPORT": { name: "Aide et support", icon: "help-circled", color: CommonStyles.themeOpenEnt.green },
  "TIMELINE": { name: "Fil de nouveautés", icon: "home", color: CommonStyles.themeOpenEnt.indigo },
  "TIMELINEGENERATOR": { name: "Frise chronologique", icon: "flow-cascade", color: CommonStyles.themeOpenEnt.yellow },
  "USERBOOK": { name: "Annuaire", icon: "address-book", color: CommonStyles.themeOpenEnt.green },
  "WIKI": { name: "Wiki", icon: "wikipedia", color: CommonStyles.themeOpenEnt.purple },
  "WORKSPACE": { name: "Espace documentaire", icon: "folder", color: CommonStyles.themeOpenEnt.red },
}

export default ({
  type,
  date,
  sender,
  message
}) => (
    <Header>
      <LeftPanel>
        <BadgeAvatar
          avatars={[sender || require("../../../assets/images/system-avatar.png")]}
          badgeContent={getAppInfos[type] && getAppInfos[type].icon}
          badgeColor={getAppInfos[type] && getAppInfos[type].color}
          customStyle={{left: undefined, right: 0}}
        />
      </LeftPanel>
      <CenterPanel>
        <Light>
          {sender && sender.displayName}
          {" "}
          {sender && sender.id === getSessionInfo().userId
            ? <Text style={{...TextColorStyle.Light}}>{I18n.t("me-indicator")}</Text>
            : null
          }
        </Light>
        <HtmlContentView
          html={message.replace(sender && sender.displayName, "").replace("\n ", "\n").trim()}
          opts={{
            hyperlinks: false,
            textFormatting: false,
            textColor: false,
            audio: false,
            video: false,
            iframes: false,
            images: false,
            globalTextStyle: {
              color: CommonStyles.textColor,
              fontFamily: CommonStyles.primaryFontFamily,
              fontSize: 12,
              fontWeight: "400"
            },
          }}
        />
        <Text style={{ ...TextColorStyle.Light, fontSize: 12}}>
          {moment(date).fromNow()}
        </Text>
      </CenterPanel>
    </Header>
  );
