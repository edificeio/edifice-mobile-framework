import * as React from 'react';

import { ListRenderItemInfo } from '@shopify/flash-list';

import { BodyBoldText } from '~/framework/components/text';

import { CommentItem, ITEM_COMMENT, ITEM_RESPONSE, ResponseItem, SocialResourceViewerItemType } from './types';

export const SocialResourceViewerCommentItem = (info: ListRenderItemInfo<CommentItem>) => {
  const itemStyle = React.useMemo(() => ({ borderRadius: 24, borderWidth: 1, padding: 16 }), []);
  return <BodyBoldText style={itemStyle}>Commentaire {info.item.value.toString()}</BodyBoldText>;
};

export const SocialResourceViewerResponseItem = (info: ListRenderItemInfo<ResponseItem>) => {
  const itemStyle = React.useMemo(() => ({ padding: 16 }), []);
  return <BodyBoldText style={itemStyle}>Réponse {info.item.value.toString()}</BodyBoldText>;
};

export const SocialResourceViewerItem = (info: ListRenderItemInfo<SocialResourceViewerItemType>) => {
  if (info.item.type === ITEM_COMMENT) {
    return <SocialResourceViewerCommentItem {...(info as ListRenderItemInfo<CommentItem>)} />;
  } else if (info.item.type === ITEM_RESPONSE) {
    return <SocialResourceViewerResponseItem {...(info as ListRenderItemInfo<ResponseItem>)} />;
  } else {
    return <BodyBoldText>ITEM INCONNU {info.item.value.toString()}</BodyBoldText>;
  }
};
