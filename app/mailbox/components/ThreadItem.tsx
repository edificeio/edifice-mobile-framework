import style from "glamorous-native";
import * as React from "react";

import { GridAvatars } from "../../ui/avatars/GridAvatars";
import { CircleNumber } from "../../ui/CircleNumber";
import {
  CenterPanel,
  Content,
  LeftPanel,
  ListItem,
  RightPanel
} from "../../ui/ContainerContent";
import { DateView } from "../../ui/DateView";

import { Me } from "../../infra/Me";
import { CommonStyles } from "../../styles/common/styles";

import { IConversationThread } from "../reducers/threadList";

export interface IThreadItemProps extends IConversationThread {
  onPress: (id: string, displayNames: string[][], subject: string) => void;
}

export default ({
  id,
  subject,
  date,
  displayNames,
  unread,
  onPress,
  to,
  from,
  cc
}: IThreadItemProps) => {
  return (
    <ListItem nb={unread} onPress={() => onPress(id, displayNames, subject)}>
      <LeftPanel>
        <GridAvatars users={findReceivers2(to, from, cc)} />
      </LeftPanel>
      <CenterPanel>
        <Author nb={unread} numberOfLines={1}>
          {findReceivers2(to, from, cc)
            .map(r => displayNames.find(dn => dn[0] === r)[1])
            .join(", ")}
        </Author>
        {subject && subject.length ? (
          <Content nb={unread} numberOfLines={1}>
            {subject}
          </Content>
        ) : (
          <style.View />
        )}
      </CenterPanel>
      <RightPanel>
        <DateView date={date} strong={unread > 0} />
        <CircleNumber nb={unread} />
      </RightPanel>
    </ListItem>
  );
};

const Author = style.text(
  {
    color: CommonStyles.textColor,
    fontSize: 14
  },
  ({ nb }) => ({
    fontFamily:
      nb > 0
        ? CommonStyles.primaryFontFamilySemibold
        : CommonStyles.primaryFontFamily
  })
);

/**
 * Make a curated list of receivers from message information (from, to, cc).
 * The result excludes the user itself, except if it's the only one.
 * to, from and cc must contain userIds.
 * @param to
 * @param from
 * @param cc
 */
export const findReceivers = (to, from, cc) => {
  cc = cc || [];
  const newTo = [...to, ...cc, from].filter(el => el !== Me.session.userId);
  if (newTo.length === 0) {
    return [Me.session.userId];
  }
  return newTo;
};

export const findReceivers2 = (to, from, cc) => {
  cc = cc || [];
  const receiversSet = new Set(
    // By using a Set we guarantee that we'll not have duplicates
    [...to, ...cc, from].filter(el => el !== Me.session.userId)
  );
  if (receiversSet.size === 0) {
    receiversSet.add(Me.session.userId);
  }
  return [...receiversSet];
};
