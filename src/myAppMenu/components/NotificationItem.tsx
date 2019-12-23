import * as React from "react";
import { View, Linking } from "react-native";
import { LayoutEvent } from "react-navigation";
import rnTextSize, { TSMeasureParams, TSMeasureResult } from "react-native-text-size"
import style from "glamorous-native";

import Conf from "../../../ode-framework-conf";

import {
  ListItem,
  LeftPanel,
  CenterPanel,
  RightPanel,
  Content
} from "./NewContainerContent";
import { DateView } from "../../ui/DateView";
import { FontWeight } from "../../ui/text";
import { BadgeAvatar } from "../../ui/BadgeAvatar";
import { Icon } from "../../ui/icons/Icon";

import { CommonStyles } from "../../styles/common/styles";

import { INotification } from "../state/notificationList";
import { contentStyle } from "../components/NewContainerContent"
import HtmlToText from "../../infra/htmlConverter/text";

export interface INotificationItemProps extends INotification {
  onPress: () => void;
}

interface INotificationItemState {
  isExtended: boolean;
  longText: boolean;
  measuredText: boolean;
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
  INotificationItemState
> {
  state= {
    isExtended: false,
    longText: false,
    measuredText: false,
  }

  public measureText = async (evt: LayoutEvent) => {
    this.setState({ measuredText: true })
    if (evt.nativeEvent.lines.length >= 2) {
      const layout = evt.nativeEvent.lines[1];
      const text = layout.text
      const {fontFamily, fontSize, fontWeight } = contentStyle
      const result: TSMeasureResult = await rnTextSize.measure({
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

  public goToUserProfile(userId: string) {
    if (!Conf.currentPlatform || !userId) {
      throw new Error("Must have a platform selected and a userId to redirect the user");
    }
    const url = `${(Conf.currentPlatform as any).url}/userbook/annuaire#${userId}`
    Linking.canOpenURL(url).then(supported => {
      if (supported) {
        Linking.openURL(url);
      } else {
        console.warn("[notification] Don't know how to open URI: ", url);
      }
    });
  }

  // Render

  public render() {
    const { date, message, params, sender, type, onPress } = this.props;
    const { isExtended, longText, measuredText } =this.state;
    const formattedContent = HtmlToText(message, !isExtended).render.replace(params.username, "").replace("\n ", "\n").trim();
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
      <ListItem>
        <LeftPanel
          disabled
          // no navigation towards user webpage for now
          // disabled={!sender}
          // onPress={() => this.goToUserProfile(sender)}
        >
          <View style={{ position: "absolute" }}>
            <BadgeAvatar
              avatars={[sender || require("../../../assets/images/system-avatar.png")]}
              badgeContent={getAppInfos[type] && getAppInfos[type].icon}
              badgeColor={getAppInfos[type] && getAppInfos[type].color}
            />
          </View>
        </LeftPanel>
        <CenterPanel onPress={() => onPress()}>
          <Author numberOfLines={1}>
            {params && params.username || getAppInfos[type] && getAppInfos[type].name}
          </Author>
          {message && message.length ? (
            <Content
              numberOfLines={isExtended ? undefined : 2}
              onTextLayout={!measuredText && this.measureText}
            >
              {formattedContent}
            </Content>
          ) : (
            <style.View />
          )}
        </CenterPanel>
        <RightPanel disabled={!longText} onPress={() => this.setState({ isExtended: !isExtended })}>
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
        </RightPanel>
      </ListItem>
    );
  }
}
