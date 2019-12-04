import style from "glamorous-native";
import I18n from "i18n-js";
import * as React from "react";
import { View, Linking } from "react-native";
import { LayoutEvent } from "react-navigation";
import rnTextSize, { TSMeasureParams, TSMeasureResult } from "react-native-text-size"

import Conf from "../../../ode-framework-conf";

import {
  NewListItem,
  NewLeftPanel,
  NewCenterPanel,
  NewRightPanel,
  NewContent
} from "./NewContainerContent";
import { DateView } from "../../ui/DateView";
import { FontWeight } from "../../ui/text";
import { BadgeAvatar } from "../../ui/BadgeAvatar";
import { Icon } from "../../ui/icons/Icon";

import { CommonStyles } from "../../styles/common/styles";

import { INotification } from "../reducers/notificationList";
import { newContentStyle } from "../components/NewContainerContent"
import HtmlToText from "../../infra/htmlConverter/text";

export interface INotificationItemProps extends INotification {
  onPress: () => void;
}

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


export class NotificationItem extends React.PureComponent<
INotificationItemProps,
{

}
> {
  state= {
    isExtended: false,
    longText: false,
    measuredText: false,
  }

// Render

  public measureText = async (evt: LayoutEvent) => {
    this.setState({ measuredText: true })
    if (evt.nativeEvent.lines.length >= 2) {
      const layout = evt.nativeEvent.lines[1];
      const text = layout.text
      const {fontFamily, fontSize, fontWeight } = newContentStyle
      const result:TSMeasureResult = await rnTextSize.measure({
        text,
        fontFamily,
        fontSize,
        fontWeight
      } as TSMeasureParams);
      if (layout.width + 1 < result.width) {
        this.setState({ longText: true })
      }
    }
  }

  // public normalizeUrl = (url:string)=>{
  //   try{
  //     return url.replace(/([^:]\/)\/+/g, "$1");
  //   }catch(e){
  //     return url;
  //   }
  // }

  // public redirectToUser(uri: string) {
  //   if (!Conf.currentPlatform) {
  //     throw new Error("Must have a platform selected to redirect the user");
  //   }
  //   //const web = "https://recette.opendigitaleducation.com/userbook/annuaire#/b92e3d37-16b0-4ed9-b4c3-992091687132#Teacher"
  //   //const test = "/userbook/annuaire#/b92e3d37-16b0-4ed9-b4c3-992091687132#Teacher"
  //   const url = `${(Conf.currentPlatform as any).url}${uri}`
  //   Linking.canOpenURL(uri).then(supported => {
  //     if (supported) {
  //       Linking.openURL(uri);
  //     } else {
  //       console.warn("[notification] Don't know how to open URI: ", url);
  //     }
  //   });
  // }

  public render() {
    const { date, message, params, sender, type, onPress } = this.props;
    const { isExtended, longText, measuredText } =this.state;
    const formattedContent = HtmlToText(message, !isExtended).render.replace(params.username, "").trim();
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

    return (
      <NewListItem>
        <NewLeftPanel disabled={params && !params.username} onPress={() => this.redirectToUser(params.uri)}>
          <BadgeAvatar
            avatars={[sender || require("../../../assets/images/system-avatar.png")]}
            badgeContent={getAppInfos[type] && getAppInfos[type].icon}
            badgeColor={getAppInfos[type] && getAppInfos[type].color}
          />
        </NewLeftPanel>
        <NewCenterPanel onPress={() => onPress()}>
          <Author numberOfLines={1}>
            {params && params.username || getAppInfos[type] && getAppInfos[type].name}
          </Author>
          {message && message.length ? (
            <NewContent
              numberOfLines={isExtended ? undefined : 2}
              onTextLayout={!measuredText && this.measureText}
            >
              {formattedContent}
            </NewContent>
          ) : (
            <style.View />
          )}
        </NewCenterPanel>
        <NewRightPanel disabled={!longText} onPress={() => this.setState({ isExtended: !isExtended })}>
          <DateView date={date}/>
          <View style={{ flex: 1, justifyContent: "center" }}>
            {longText &&
              <Icon
                name="arrow_down"
                color={"#868CA0"}
                style={isExtended && {transform: [{ rotate: "180deg" }]}}
              />
            }
          </View>
        </NewRightPanel>
      </NewListItem>
    );
  }
}
