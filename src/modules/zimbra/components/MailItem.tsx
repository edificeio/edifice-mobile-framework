import * as React from 'react';

import { SmallBoldText, SmallText } from '~/framework/components/text';
import { getUserSession } from '~/framework/util/session';

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
