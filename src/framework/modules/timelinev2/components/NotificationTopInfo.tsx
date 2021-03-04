/**
 * Information about a timeline notification. Displayed in the header.
 */
import * as React from "react";
import { Text } from "react-native";
import I18n from "i18n-js";
import moment from "moment";

import { CenterPanel, Header, LeftPanel } from "../../../../ui/ContainerContent";
import { BadgeAvatar } from "../../../../ui/BadgeAvatar";
import { HtmlContentView } from "../../../../ui/HtmlContentView";
import { getSessionInfo } from "../../../../App";
import { APPBADGES } from "../appBadges";
import { INotification } from "../reducer/notifications";
import theme from "../../../theme";

export default ({notification}: {notification: INotification}) => {
  const message = notification && notification.message;
  const type = notification && notification.type;
  const date = notification && notification.date;
  const sender = notification && notification.sender;
  const resource = notification && notification.resource;

  let formattedMessage = message;
  if (message) {
    const isSenderMe = sender && sender.id === getSessionInfo().userId;
    if (resource && resource.name) formattedMessage = formattedMessage.replace(resource.name, ` ${resource.name} `);
    if (sender && sender.displayName) formattedMessage = formattedMessage.replace(/<br.*?>/, "").replace(sender.displayName, `${sender.displayName} `);
    if (isSenderMe) formattedMessage = formattedMessage.replace(sender && sender.displayName, `${sender.displayName} ${I18n.t("me-indicator")} `);
  }

  return (
    <Header>
      <LeftPanel>
        <BadgeAvatar
          avatars={[sender || require("../../../../../assets/images/system-avatar.png")]}
          badgeContent={APPBADGES[type] && APPBADGES[type].icon}
          badgeColor={APPBADGES[type] && APPBADGES[type].color}
          customStyle={{left: undefined, right: 0}}
        />
      </LeftPanel>
      <CenterPanel>
        <HtmlContentView
          html={formattedMessage}
          opts={{
            hyperlinks: false,
            textFormatting: false,
            textColor: false,
            audio: false,
            video: false,
            iframes: false,
            images: false,
            globalTextStyle: {
              color: theme.color.text.regular,
              fontSize: 12,
              fontWeight: "400"
            },
          }}
        />
        <Text style={{ color: theme.color.text.light, fontSize: 12 }}>
          {moment(date).fromNow()}
        </Text>
      </CenterPanel>
    </Header>
  );
}
