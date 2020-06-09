/**
 * Information about a post. Displayed just before a notification in timeline.
 */
import I18n from "i18n-js";

import * as React from "react";
import { Text } from "react-native";

import { SingleAvatar } from "../../ui/avatars/SingleAvatar";
import { CenterPanel, Header, LeftPanel } from "../../ui/ContainerContent";
import { Heavy, Light } from "../../ui/Typography";
import { CommonStyles } from "../../styles/common/styles";
import { getTimeToStr } from "../../utils/date";
import { getSessionInfo } from "../../App";
import { TextLight, TextColor } from "../../ui/text";

export default ({
  senderId,
  senderName,
  eventType,
  type,
  resourceName,
  date
}) => (
    <Header>
      <LeftPanel>
        <SingleAvatar userId={senderId} />
      </LeftPanel>
      <CenterPanel>
        <Heavy>
          {senderName}{senderId === getSessionInfo().userId
            ? <TextLight color={TextColor.Light}>{` ${I18n.t('me-indicator')}`}</TextLight>
            : ''
          }
          <Light>
            {" "}
            {I18n.t(`timeline-eventType-${eventType}`)}{" "}
            {eventType !== "ACKNOWLEDGE" // Acknowledge notifs has their own text
              ? I18n.t(`timeline-postType-${type}`) + " "
              : null}
          </Light>
          {resourceName}
        </Heavy>
        <Text
          style={{
            color: CommonStyles.lightTextColor,
            fontFamily: CommonStyles.primaryFontFamily,
            fontSize: 14
          }}
        >
          {/* FIXME: Use moment.js instead of this */}
          {getTimeToStr(date)}
        </Text>
      </CenterPanel>
    </Header>
  );
