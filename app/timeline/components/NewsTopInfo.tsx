/**
 * Information about a post. Displayed just before a notification in timeline.
 */
import I18n from "i18n-js";

import * as React from "react";

import { SingleAvatar } from "../../ui/avatars/SingleAvatar";
import { CenterPanel, Header, LeftPanel } from "../../ui/ContainerContent";
import { DateView } from "../../ui/DateView";
import { Bold, Light } from "../../ui/Typography";

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
      <Bold>
        {senderName}
        <Light>
          {" "}
          {I18n.t(`timeline-eventType-${eventType}`)}{" "}
          {I18n.t(`timeline-postType-${type}`)}{" "}
        </Light>
        {resourceName}
      </Bold>
      <DateView date={date} short={false} />
    </CenterPanel>
  </Header>
);
