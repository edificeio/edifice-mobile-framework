import * as React from 'react';
import { View } from 'react-native';

import { ListRenderItemInfo } from '@shopify/flash-list';

import { I18n } from '~/app/i18n';
import { SingleAvatar } from '~/framework/components/avatar';
import { GhostButton } from '~/framework/components/button';
import { BodyBoldText, CaptionItalicText, SmallBoldText, SmallItalicText, SmallText } from '~/framework/components/text';
import { AccountTypeText } from '~/framework/modules/auth/components/account-type-text';
import { TemporalTimeText } from '~/framework/util/date';

import styles from './styles';
import { SocialResourceViewerInternals } from './types';

export const SocialResourceViewerCommentItem = (info: ListRenderItemInfo<SocialResourceViewerInternals.CommentItem>) => {
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

export const SocialResourceViewerCommentDeletedItem = (
  info: ListRenderItemInfo<SocialResourceViewerInternals.CommentItemDeleted>,
) => {
  const itemStyle = React.useMemo(() => [styles.itemCommon, styles.itemComment], []);
  const contentStyle = React.useMemo(
    () => [styles.itemCommentContentWrapper, info.item.hasResponses && styles.itemCommentContentWrapperDeletedComment],
    [info.item.hasResponses],
  );

  return (
    <View style={itemStyle}>
      <View style={contentStyle}>
        <SocialResourceViewerContentDeletedItem {...info} />
      </View>
    </View>
  );
};

export const SocialResourceViewerResponseItem = (info: ListRenderItemInfo<SocialResourceViewerInternals.ResponseItem>) => {
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

export const SocialResourceViewerResponseDeletedItem = (
  info: ListRenderItemInfo<SocialResourceViewerInternals.ResponseItemDeleted>,
) => {
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

export const SocialResourceViewerContentItem = (
  info: ListRenderItemInfo<SocialResourceViewerInternals.CommentItem | SocialResourceViewerInternals.ResponseItem>,
) => {
  const { item } = info;
  return (
    <>
      <View style={styles.itemUserHeader}>
        <SmallBoldText numberOfLines={1} style={styles.itemAuthor}>
          {item.authorName}
          {I18n.get('common-separator-dash')}
        </SmallBoldText>
        <AccountTypeText type={item.authorAccountType} TextComponent={SmallBoldText} />
        <CaptionItalicText numberOfLines={1} style={styles.itemDate}>
          <TemporalTimeText instant={item.date} timeFormat="time-small" dateFormat="date-small" relative />
        </CaptionItalicText>
      </View>
      <View>
        <SmallText style={styles.itemContentText}>{item.content}</SmallText>
        <View style={styles.itemContentButtons} />
      </View>
    </>
  );
};

export const SocialResourceViewerContentDeletedItem = (
  _: ListRenderItemInfo<SocialResourceViewerInternals.CommentItemDeleted | SocialResourceViewerInternals.ResponseItemDeleted>,
) => {
  const containerStye = React.useMemo(() => [styles.itemContentText, styles.itemContentDeletedText], []);
  return <SmallItalicText style={containerStye}>{I18n.get('comment-deleted')}</SmallItalicText>;
};

export const SocialResourceViewerShowMoreResponsesItem = (
  info: ListRenderItemInfo<SocialResourceViewerInternals.ResponseItemEllipsis>,
) => {
  const { item } = info;
  const itemStyle = React.useMemo(() => [styles.itemCommon, styles.itemResponse], []);
  const itemTreeStyle = React.useMemo(() => [styles.itemTreeCommon, styles.itemTreeResponse], []);
  const itemTreeCurveStyle = React.useMemo(() => [styles.itemTreeDecoCurveCommon, styles.itemTreeDecoCurveTop], []);

  return (
    <View style={itemStyle}>
      <View style={itemTreeStyle}>
        <View style={itemTreeCurveStyle} />
      </View>
      <View style={styles.itemResponsesShowMoreButtonWrapper}>
        <GhostButton testID="social-responses-show-more" text={`Lire plus de réponses (${item.count})`} />
      </View>
    </View>
  );
};

export const SocialResourceViewerItem = (info: ListRenderItemInfo<SocialResourceViewerInternals.Item>) => {
  if (info.item.type === SocialResourceViewerInternals.ITEM_COMMENT) {
    return <SocialResourceViewerCommentItem {...(info as ListRenderItemInfo<SocialResourceViewerInternals.CommentItem>)} />;
  } else if (info.item.type === SocialResourceViewerInternals.ITEM_RESPONSE) {
    return <SocialResourceViewerResponseItem {...(info as ListRenderItemInfo<SocialResourceViewerInternals.ResponseItem>)} />;
  } else if (info.item.type === SocialResourceViewerInternals.ITEM_COMMENT_DELETED) {
    return (
      <SocialResourceViewerCommentDeletedItem {...(info as ListRenderItemInfo<SocialResourceViewerInternals.CommentItemDeleted>)} />
    );
  } else if (info.item.type === SocialResourceViewerInternals.ITEM_RESPONSE_DELETED) {
    return (
      <SocialResourceViewerResponseDeletedItem
        {...(info as ListRenderItemInfo<SocialResourceViewerInternals.ResponseItemDeleted>)}
      />
    );
  } else if (info.item.type === SocialResourceViewerInternals.ITEM_RESPONSE_ELLIPSIS) {
    return (
      <SocialResourceViewerShowMoreResponsesItem
        {...(info as ListRenderItemInfo<SocialResourceViewerInternals.ResponseItemEllipsis>)}
      />
    );
  } else {
    return <BodyBoldText>${info.item.toString()}</BodyBoldText>;
  }
};
