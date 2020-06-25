import style from "glamorous-native";
import I18n from "i18n-js";
import * as React from "react";

import { BadgeAvatar } from "../../ui/BadgeAvatar";
import { 
  CenterPanel, 
  Content, 
  LeftPanel,
  ListItem,
  RightPanel
} from "../../ui/ContainerContent";
import { DateView } from "../../ui/DateView";

import { CommonStyles } from "../../styles/common/styles";

import { FontWeight } from "../../ui/text";
import { getSessionInfo } from "../../AppStore";


//TODO extract mail-specific field in order to make this component dumb

export default ({
  id,
  subject,
  date,
  displayNames,
  unread,
  onPress,
  to,
  from,
  cc,
  ...others
}) => {
  return (
    <ListItem nb={unread} onPress={() => onPress(id, displayNames, subject)}>
      <LeftPanel>
        <BadgeAvatar avatars={findReceiversAvatars(to, from, cc, displayNames)} badgeContent={unread} />
      </LeftPanel>
      <CenterPanel style={{ marginRight: 0, paddingRight: 0 }}>
        <Author nb={unread} numberOfLines={1}>
          {findReceivers2(to, from, cc)
            .map(r => {
              const u = displayNames.find(dn => dn[0] === r);
              return u ? u[1] : I18n.t("unknown-user");
            })
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
      </RightPanel>
    </ListItem>
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

export const findReceivers = (to, from, cc) => {
  cc = cc || [];
  const newTo = from
    ? [...to, ...cc, from].filter(el => el !== getSessionInfo().userId)
    : [...to, ...cc].filter(el => el !== getSessionInfo().userId);
  if (newTo.length === 0) {
    return [getSessionInfo().userId];
  }
  return newTo;
};

export const findReceivers2 = (to, from, cc) => {
  cc = cc || [];
  const receiversSet = new Set([...to, ...cc, from].filter(el => el && el !== getSessionInfo().userId));
  if (receiversSet.size === 0) {
    receiversSet.add(getSessionInfo().userId);
  }
  return [...receiversSet];
};

export const findReceiversAvatars = (to, from, cc, displayNames) => {
  const receiversIds: string[] = findReceivers2(to, from, cc);
  return receiversIds.map((receiverId: string) => {
    const foundDisplayName = displayNames.find(displayName => displayName[0] === receiverId);
    return foundDisplayName ? { id: receiverId, isGroup: foundDisplayName[2]} : {};
  })
};
