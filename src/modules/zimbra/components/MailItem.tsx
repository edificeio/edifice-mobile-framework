import I18n from 'i18n-js';
import * as React from 'react';
import { View, ViewStyle } from 'react-native';

import { SmallBoldText, SmallText } from '~/framework/components/text';
import { getUserSession } from '~/framework/util/session';
import { BadgeAvatar } from '~/ui/BadgeAvatar';
import { CenterPanel, Content, LeftPanel, ListItem, RightPanel } from '~/ui/ContainerContent';
import { DateView } from '~/ui/DateView';

export const Author = props =>
  props.nb > 0 ? <SmallBoldText>{props.children}</SmallBoldText> : <SmallText>{props.children}</SmallText>;

export const findReceivers2 = (to, from, cc) => {
  cc = cc || [];
  const receiversSet = new Set([...to, ...cc, from].filter(el => el && el !== getUserSession().user.id));
  if (receiversSet.size === 0) {
    receiversSet.add(getUserSession().user.id);
  }
  return [...receiversSet];
};

export const findReceiversAvatars = (to, from, cc, displayNames) => {
  const receiversIds: string[] = findReceivers2(to, from, cc);
  return receiversIds.map((receiverId: string) => {
    const foundDisplayName = displayNames.find(displayName => displayName[0] === receiverId);
    return foundDisplayName ? { id: receiverId, isGroup: foundDisplayName[2] } : {};
  });
};

export const findSenderAvatar = (from, displayNames) => {
  const foundDisplayName = displayNames.find(displayName => displayName[0] === from);
  return foundDisplayName ? [{ id: from, isGroup: foundDisplayName[2] }] : [{}];
};

//TODO extract mail-specific field in order to make this component dumb

export default ({ id, subject, date, displayNames, unread, onPress, to, from, cc, ...others }) => {
  const centerPanelStyle = {
    marginRight: 0,
    paddingRight: 0,
  } as ViewStyle;

  return (
    <ListItem nb={unread} onPress={() => onPress(id, displayNames, subject)}>
      <LeftPanel>
        <BadgeAvatar avatars={findReceiversAvatars(to, from, cc, displayNames)} badgeContent={unread} />
      </LeftPanel>
      <CenterPanel style={centerPanelStyle}>
        <Author nb={unread} numberOfLines={1}>
          {findReceivers2(to, from, cc)
            .map(r => {
              const u = displayNames.find(dn => dn[0] === r);
              return u ? u[1] : I18n.t('unknown-user');
            })
            .join(', ')}
        </Author>
        {subject && subject.length ? (
          <Content nb={unread} numberOfLines={1}>
            {subject}
          </Content>
        ) : (
          <View />
        )}
      </CenterPanel>
      <RightPanel>
        <DateView date={date} strong={unread > 0} />
      </RightPanel>
    </ListItem>
  );
};
