import * as React from 'react';
import { View } from 'react-native';

import { ListRenderItemInfo } from '@shopify/flash-list';

import { I18n } from '~/app/i18n';
import { SingleAvatar } from '~/framework/components/avatar';
import { BodyBoldText, CaptionItalicText, SmallItalicText, SmallText } from '~/framework/components/text';
import { AccountTypeText } from '~/framework/modules/auth/components/account-type-text';
import { TemporalTimeText } from '~/framework/util/date';

import styles from './styles';
import {
  CommentItem,
  ITEM_COMMENT,
  ITEM_COMMENT_DELETED,
  ITEM_RESPONSE,
  ITEM_RESPONSE_DELETED,
  ResponseItem,
  SocialResourceViewerItemType,
} from './types';

export const SocialResourceViewerCommentItem = (info: ListRenderItemInfo<CommentItem>) => {
  const { item } = info;
  const itemStyle = React.useMemo(() => [styles.itemCommon, styles.itemComment], []);
  const itemTreeStyle = React.useMemo(() => [styles.itemTreeCommon, styles.itemTreeComment], []);
  const itemTreeDecoStyle = React.useMemo(() => [styles.itemTreeDecoStraight, styles.itemTreeDecoStraightComment], []);

  return (
    <View style={itemStyle}>
      <View style={itemTreeStyle}>
        <SingleAvatar size="xsm" userId={item.authorId} />
        {item.hasResponses && <View style={itemTreeDecoStyle} />}
      </View>
      <View style={styles.itemCommentContentWrapper}>
        <SocialResourceViewerContentItem {...info} />
      </View>
    </View>
  );
};

export const SocialResourceViewerCommentDeletedItem = (info: ListRenderItemInfo<CommentItem>) => {
  const itemStyle = React.useMemo(() => [styles.itemCommon, styles.itemComment], []);
  const contentStyle = React.useMemo(
    () => [styles.itemCommentContentWrapper, info.item.hasResponses && styles.itemCommentContentWrapperDeletedComment],
    [],
  );

  return (
    <View style={itemStyle}>
      <View style={contentStyle}>
        <SocialResourceViewerContentDeletedItem {...info} />
      </View>
    </View>
  );
};

export const SocialResourceViewerResponseItem = (info: ListRenderItemInfo<ResponseItem>) => {
  const { item } = info;
  const itemStyle = React.useMemo(() => [styles.itemCommon, styles.itemResponse], []);
  const itemTreeStyle = React.useMemo(() => [styles.itemTreeCommon, styles.itemTreeResponse], []);
  const itemAvatarStyle = React.useMemo(() => [styles.itemTreeCommon, styles.itemResponseAvatar], []);
  const itemTreeCurveStyle = React.useMemo(() => [styles.itemTreeDecoCurveCommon, styles.itemTreeDecoCurveTop], []);
  const itemTreeDecoStyle = React.useMemo(() => [styles.itemTreeDecoStraight], []);

  return (
    <View style={itemStyle}>
      <View style={itemTreeStyle}>
        <View style={itemTreeCurveStyle} />
        {item.hasResponses && <View style={itemTreeDecoStyle} />}
      </View>
      <View style={itemAvatarStyle}>
        <SingleAvatar size="xsm" userId={item.authorId} />
      </View>
      <View style={styles.itemResponseContentWrapper}>
        <SocialResourceViewerContentItem {...info} />
      </View>
    </View>
  );
};

export const SocialResourceViewerResponseDeletedItem = (info: ListRenderItemInfo<ResponseItem>) => {
  const { item } = info;
  const itemStyle = React.useMemo(() => [styles.itemCommon, styles.itemResponse, styles.itemResponseDeleted], []);
  const itemTreeStyle = React.useMemo(() => [styles.itemTreeCommon, styles.itemTreeResponse, styles.itemTreeResponseDeleted], []);
  const itemTreeCurveStyle = React.useMemo(() => [styles.itemTreeDecoCurveCommon, styles.itemTreeDecoCurveCenter], []);
  const itemTreeDecoStyle = React.useMemo(() => [styles.itemTreeDecoStraight], []);
  const itemTreeDecoCurveStyle = React.useMemo(() => [styles.itemTreeDecoStraight, styles.itemTreeDecoStraightTop], []);

  return (
    <View style={itemStyle}>
      <View style={itemTreeStyle}>
        <View style={itemTreeDecoCurveStyle} />
        <View style={itemTreeCurveStyle} />
        {item.hasResponses && <View style={itemTreeDecoStyle} />}
      </View>
      <View style={styles.itemResponseContentWrapper}>
        <SocialResourceViewerContentDeletedItem {...info} />
      </View>
    </View>
  );
};

export const SocialResourceViewerContentItem = (info: ListRenderItemInfo<CommentItem | ResponseItem>) => {
  const { item } = info;
  return (
    <>
      <View style={styles.itemUserHeader}>
        <BodyBoldText numberOfLines={1} style={styles.itemAuthor}>
          {item.authorName}
          {I18n.get('common-separator-dash')}
        </BodyBoldText>
        <AccountTypeText type={item.authorAccountType} TextComponent={BodyBoldText} />
        <CaptionItalicText numberOfLines={1} style={styles.itemDate}>
          <TemporalTimeText instant={item.date} timeFormat="time-small" dateFormat="date-small" relative />
        </CaptionItalicText>
      </View>
      <View>
        <SmallText style={styles.itemContentText}>{item.value}</SmallText>
        <View style={styles.itemContentButtons} />
      </View>
    </>
  );
};

export const SocialResourceViewerContentDeletedItem = (_: ListRenderItemInfo<CommentItem | ResponseItem>) => {
  const containerStye = React.useMemo(() => [styles.itemContentText, styles.itemContentDeletedText], []);
  return <SmallItalicText style={containerStye}>{I18n.get('comment-deleted')}</SmallItalicText>;
};

export const SocialResourceViewerItem = (info: ListRenderItemInfo<SocialResourceViewerItemType>) => {
  if (info.item.type === ITEM_COMMENT) {
    return <SocialResourceViewerCommentItem {...(info as ListRenderItemInfo<CommentItem>)} />;
  } else if (info.item.type === ITEM_RESPONSE) {
    return <SocialResourceViewerResponseItem {...(info as ListRenderItemInfo<ResponseItem>)} />;
  } else if (info.item.type === ITEM_COMMENT_DELETED) {
    return <SocialResourceViewerCommentDeletedItem {...(info as ListRenderItemInfo<CommentItem>)} />;
  } else if (info.item.type === ITEM_RESPONSE_DELETED) {
    return <SocialResourceViewerResponseDeletedItem {...(info as ListRenderItemInfo<ResponseItem>)} />;
  } else {
    return <BodyBoldText>${info.item.toString()}</BodyBoldText>;
  }
};
