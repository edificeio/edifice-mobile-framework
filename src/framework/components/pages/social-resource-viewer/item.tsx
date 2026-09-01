import * as React from 'react';
import { View } from 'react-native';

import { ListRenderItemInfo } from '@shopify/flash-list';
import { useSelector } from 'react-redux';

import { I18n } from '~/app/i18n';
import { SingleAvatar } from '~/framework/components/avatar';
import { GhostButton, TerciaryButton } from '~/framework/components/button';
import { CaptionItalicText, SmallBoldText, SmallItalicText, SmallText } from '~/framework/components/text';
import { AccountTypeText } from '~/framework/modules/auth/components/account-type-text';
import { selectors } from '~/framework/modules/auth/redux/reducer';
import { TemporalTimeText } from '~/framework/util/date';

import { SocialResourceViewerContext } from './context';
import { SocialResourceViewerAddResponseForm, SocialResourceViewerEditCommentForm } from './form';
import styles from './styles';
import { SocialResourceViewer, SocialResourceViewerInternals } from './types';

export const SocialResourceViewerCommentItem = ({
  allowResponses,
  canAddComment,
  onPressDelete,
  onPressEdit,
  onPressReply,
  ...info
}: ListRenderItemInfo<SocialResourceViewerInternals.CommentItem> & {
  canAddComment?: boolean;
  onPressReply?: (item: SocialResourceViewerInternals.CommentItem, index: number) => void;
  onPressEdit?: (
    item: SocialResourceViewerInternals.CommentItem | SocialResourceViewerInternals.ResponseItem,
    index: number,
  ) => void;
  onPressDelete?: (
    item: SocialResourceViewerInternals.CommentItem | SocialResourceViewerInternals.ResponseItem,
    index: number,
  ) => void;
} & Partial<Pick<SocialResourceViewer.CommentsConfig, 'allowResponses'>>) => {
  const { item } = info;
  const itemStyle = React.useMemo(() => [styles.itemCommon, styles.itemComment], []);
  const itemTreeStyle = React.useMemo(() => [styles.itemTreeCommon, styles.itemTreeComment], []);
  const itemTreeDecoStyle = React.useMemo(() => [styles.itemTreeDecoStraight, styles.itemTreeDecoStraightComment], []);

  return (
    <View style={itemStyle}>
      <View style={itemTreeStyle}>
        <SingleAvatar size="xsm" userId={item.authorId} />
        {item.nbResponses > 0 && <View style={itemTreeDecoStyle} />}
      </View>
      <View style={styles.itemCommentContentWrapper}>
        <SocialResourceViewerContentItem
          allowResponses={allowResponses}
          canAddComment={canAddComment}
          onPressReply={onPressReply}
          onPressEdit={onPressEdit}
          onPressDelete={onPressDelete}
          {...info}
        />
      </View>
    </View>
  );
};

export const SocialResourceViewerCommentDeletedItem = (
  info: ListRenderItemInfo<SocialResourceViewerInternals.CommentItemDeleted>,
) => {
  const itemStyle = React.useMemo(() => [styles.itemCommon, styles.itemComment], []);
  const contentStyle = React.useMemo(
    () => [styles.itemCommentContentWrapper, info.item.nbResponses > 0 && styles.itemCommentContentWrapperDeletedComment],
    [info.item.nbResponses],
  );

  return (
    <View style={itemStyle}>
      <View style={contentStyle}>
        <SocialResourceViewerContentDeletedItem {...info} />
      </View>
    </View>
  );
};

export const SocialResourceViewerResponseItem = ({
  canAddComment,
  onPressDelete,
  onPressEdit,
  ...info
}: ListRenderItemInfo<SocialResourceViewerInternals.ResponseItem> & {
  canAddComment?: boolean;
  onPressEdit?: (
    item: SocialResourceViewerInternals.CommentItem | SocialResourceViewerInternals.ResponseItem,
    index: number,
  ) => void;
  onPressDelete?: (
    item: SocialResourceViewerInternals.CommentItem | SocialResourceViewerInternals.ResponseItem,
    index: number,
  ) => void;
}) => {
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
        <SocialResourceViewerContentItem
          canAddComment={canAddComment}
          onPressEdit={onPressEdit}
          onPressDelete={onPressDelete}
          {...info}
        />
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

export const SocialResourceViewerContentItemHeader = ({
  ...info
}: ListRenderItemInfo<SocialResourceViewerInternals.CommentItem | SocialResourceViewerInternals.ResponseItem>) => {
  const { item } = info;
  return (
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
  );
};

export const SocialResourceViewerContentItem = ({
  allowResponses,
  canAddComment,
  onPressDelete: _onPressDelete,
  onPressEdit: _onPressEdit,
  onPressReply: _onPressReply,
  ...info
}: ListRenderItemInfo<SocialResourceViewerInternals.CommentItem | SocialResourceViewerInternals.ResponseItem> & {
  canAddComment?: boolean;
  onPressReply?: (item: SocialResourceViewerInternals.CommentItem, index: number) => void;
  onPressEdit?: (
    item: SocialResourceViewerInternals.CommentItem | SocialResourceViewerInternals.ResponseItem,
    index: number,
  ) => void;
  onPressDelete?: (
    item: SocialResourceViewerInternals.CommentItem | SocialResourceViewerInternals.ResponseItem,
    index: number,
  ) => void;
} & Partial<Pick<SocialResourceViewer.CommentsConfig, 'allowResponses'>>) => {
  const { index, item } = info;
  const session = useSelector(selectors.session);
  const isAuthor = session && item.authorId === session.user.id;
  const onPressReply = React.useCallback(() => {
    _onPressReply?.(item as SocialResourceViewerInternals.CommentItem, index);
  }, [_onPressReply, index, item]);
  const onPressEdit = React.useCallback(() => {
    _onPressEdit?.(item as SocialResourceViewerInternals.CommentItem | SocialResourceViewerInternals.ResponseItem, index);
  }, [_onPressEdit, index, item]);
  const onPressDelete = React.useCallback(() => {
    _onPressDelete?.(item as SocialResourceViewerInternals.CommentItem | SocialResourceViewerInternals.ResponseItem, index);
  }, [_onPressDelete, index, item]);
  return (
    <>
      <SocialResourceViewerContentItemHeader {...info} />
      <View>
        <SmallText style={styles.itemContentText}>{item.content}</SmallText>
        {session && canAddComment && (
          <View style={styles.itemContentButtons}>
            {allowResponses && item.type === SocialResourceViewerInternals.ITEM_COMMENT && (
              <TerciaryButton text={I18n.get('comment-reply')} testID="comment-reply" onPress={onPressReply} />
            )}
            {isAuthor && <TerciaryButton text={I18n.get('comment-edit')} testID="comment-edit" onPress={onPressEdit} />}
            {isAuthor && <TerciaryButton text={I18n.get('comment-delete')} testID="comment-delete" onPress={onPressDelete} />}
          </View>
        )}
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

export const SocialResourceViewerShowMoreResponsesItem = ({
  onShowResponses,
  ...info
}: ListRenderItemInfo<SocialResourceViewerInternals.ResponseItemEllipsis> & {
  onShowResponses?: (id: string, start: number, count: number) => void;
}) => {
  const { item } = info;
  const itemStyle = React.useMemo(() => [styles.itemCommon, styles.itemResponse], []);
  const itemTreeStyle = React.useMemo(() => [styles.itemTreeCommon, styles.itemTreeResponse], []);
  const itemTreeCurveStyle = React.useMemo(() => [styles.itemTreeDecoCurveCommon, styles.itemTreeDecoCurveTop], []);
  const itemTreeDecoStyle = React.useMemo(() => [styles.itemTreeDecoStraight], []);
  const showResponses = React.useCallback(() => {
    onShowResponses?.(item.inReplyTo, item.start, item.count);
  }, [item.count, item.inReplyTo, item.start, onShowResponses]);

  return (
    <View style={itemStyle}>
      <View style={itemTreeStyle}>
        <View style={itemTreeCurveStyle} />
        {item.hasResponses && <View style={itemTreeDecoStyle} />}
      </View>
      <View style={styles.itemResponsesShowMoreButtonWrapper}>
        <GhostButton
          onPress={showResponses}
          testID="social-responses-show-more"
          text={I18n.get('comment-read-more-responses', { count: item.count })}
        />
      </View>
    </View>
  );
};

export const SocialResourceViewerAddResponseItem = ({
  inputRef,
  onSubmit,
}: ListRenderItemInfo<SocialResourceViewerInternals.AddResponseItem> & {
  onSubmit?: SocialResourceViewer.Props['onSubmit'];
  inputRef?: SocialResourceViewerInternals.ItemProps['inputRef'];
}) => {
  const itemStyle = React.useMemo(() => [styles.itemCommon, styles.itemResponse], []);
  const itemTreeStyle = React.useMemo(() => [styles.itemTreeCommon, styles.itemTreeResponse], []);
  const itemTreeCurveStyle = React.useMemo(() => [styles.itemTreeDecoCurveCommon, styles.itemTreeDecoCurveForm], []);

  return (
    <View style={itemStyle}>
      <View style={itemTreeStyle}>
        <View style={itemTreeCurveStyle} />
      </View>
      <SocialResourceViewerAddResponseForm onSubmit={onSubmit} ref={inputRef} />
    </View>
  );
};

export const SocialResourceViewerEditCommentItem = ({
  inputRef,
  onSubmit,
  ...info
}: ListRenderItemInfo<SocialResourceViewerInternals.CommentItem> & {
  onSubmit?: SocialResourceViewer.Props['onEdit'];
  inputRef?: SocialResourceViewerInternals.ItemProps['inputRef'];
}) => {
  const { item } = info;
  const itemStyle = React.useMemo(() => [styles.itemCommon, styles.itemComment], []);
  const itemTreeStyle = React.useMemo(() => [styles.itemTreeCommon, styles.itemTreeComment], []);
  const itemTreeDecoStyle = React.useMemo(() => [styles.itemTreeDecoStraight, styles.itemTreeDecoStraightComment], []);

  return (
    <View style={itemStyle}>
      <View style={itemTreeStyle}>
        <SingleAvatar size="xsm" userId={item.authorId} />
        {item.nbResponses > 0 && <View style={itemTreeDecoStyle} />}
      </View>
      <View style={styles.itemCommentContentWrapper}>
        <SocialResourceViewerContentItemHeader {...info} />
        <SocialResourceViewerEditCommentForm onSubmit={onSubmit} ref={inputRef} {...info} />
      </View>
    </View>
  );
};

export const SocialResourceViewerEditResponseItem = ({
  inputRef,
  onSubmit,
  ...info
}: ListRenderItemInfo<SocialResourceViewerInternals.ResponseItem> & {
  onSubmit?: SocialResourceViewer.Props['onEdit'];
  inputRef?: SocialResourceViewerInternals.ItemProps['inputRef'];
}) => {
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
        <SocialResourceViewerContentItemHeader {...info} />
        <SocialResourceViewerEditCommentForm onSubmit={onSubmit} ref={inputRef} {...info} />
      </View>
    </View>
  );
};

export const SocialResourceViewerItem = ({
  allowResponses,
  canAddComment,
  inputRef,
  onPressDelete,
  onPressEdit,
  onPressReply,
  onSendEdit,
  onSendReply,
  onShowResponses,
  ...info
}: SocialResourceViewerInternals.ItemProps) => {
  const [editContext] = React.useContext(SocialResourceViewerContext);

  if (info.item.type === SocialResourceViewerInternals.ITEM_COMMENT) {
    return editContext.editId === info.item.id ? (
      <SocialResourceViewerEditCommentItem
        {...(info as ListRenderItemInfo<SocialResourceViewerInternals.CommentItem>)}
        onSubmit={onSendEdit}
        inputRef={inputRef}
      />
    ) : (
      <SocialResourceViewerCommentItem
        allowResponses={allowResponses}
        canAddComment={canAddComment}
        onPressReply={onPressReply}
        onPressEdit={onPressEdit}
        onPressDelete={onPressDelete}
        {...(info as ListRenderItemInfo<SocialResourceViewerInternals.CommentItem>)}
      />
    );
  } else if (info.item.type === SocialResourceViewerInternals.ITEM_RESPONSE) {
    return editContext.editId === info.item.id ? (
      <SocialResourceViewerEditResponseItem
        {...(info as ListRenderItemInfo<SocialResourceViewerInternals.ResponseItem>)}
        onSubmit={onSendEdit}
        inputRef={inputRef}
      />
    ) : (
      <SocialResourceViewerResponseItem
        canAddComment={canAddComment}
        onPressEdit={onPressEdit}
        onPressDelete={onPressDelete}
        {...(info as ListRenderItemInfo<SocialResourceViewerInternals.ResponseItem>)}
      />
    );
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
        onShowResponses={onShowResponses}
      />
    );
  } else if (info.item.type === SocialResourceViewerInternals.ITEM_ADD_RESPONSE) {
    return (
      <SocialResourceViewerAddResponseItem
        {...(info as ListRenderItemInfo<SocialResourceViewerInternals.AddResponseItem>)}
        onSubmit={onSendReply}
        inputRef={inputRef}
      />
    );
  } else {
    console.warn(`[SocialResourceViewer]: Unknown item type "${(info.item as { type: any }).type}" at index ${info.index}`);
    return null;
  }
};
