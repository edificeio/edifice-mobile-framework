import * as React from 'react';
import { ListRenderItemInfo, View } from 'react-native';

import { useSelector } from 'react-redux';

import { I18n } from '~/app/i18n';
import { SingleAvatar } from '~/framework/components/avatar';
import { GhostButton, TerciaryButton } from '~/framework/components/button';
import { CaptionItalicText, SmallBoldText, SmallItalicText, SmallText } from '~/framework/components/text';
import { AccountTypeText } from '~/framework/modules/auth/components/account-type-text';
import { selectors } from '~/framework/modules/auth/redux/reducer';
import { TemporalTimeText } from '~/framework/util/date';

import { CommentsThreadContext } from './context';
import { CommentsThreadEditForm } from './form';
import styles from './styles';
import { CommentsThreadConfig, CommentsThreadInternals, CommentsThreadProps } from './types';

export namespace CommentsThread {
  export const CommentItem = ({
    allowReplies,
    canAddComment,
    onPressDelete,
    onPressEdit,
    onPressReply,
    ...info
  }: ListRenderItemInfo<CommentsThreadInternals.CommentItem> & {
    canAddComment?: boolean;
    onPressReply?: (item: CommentsThreadInternals.CommentItem, index: number) => void;
    onPressEdit?: (item: CommentsThreadInternals.CommentItem | CommentsThreadInternals.ReplyItem, index: number) => void;
    onPressDelete?: (item: CommentsThreadInternals.CommentItem | CommentsThreadInternals.ReplyItem, index: number) => void;
  } & Partial<Pick<CommentsThreadConfig, 'allowReplies'>>) => {
    const { item } = info;
    const itemStyle = React.useMemo(() => [styles.itemCommon, styles.itemComment], []);
    const itemTreeStyle = React.useMemo(() => [styles.itemTreeCommon, styles.itemTreeComment], []);
    const itemTreeDecoStyle = React.useMemo(() => [styles.itemTreeDecoStraight, styles.itemTreeDecoStraightComment], []);

    return (
      <View style={itemStyle}>
        <View style={itemTreeStyle}>
          <SingleAvatar size="xsm" userId={item.authorId} />
          {item.nbReplies > 0 && <View style={itemTreeDecoStyle} />}
        </View>
        <View style={styles.itemCommentContentWrapper}>
          <ContentItem
            allowReplies={allowReplies}
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

  export const DeletedCommentItem = (info: ListRenderItemInfo<CommentsThreadInternals.CommentDeletedItem>) => {
    const itemStyle = React.useMemo(() => [styles.itemCommon, styles.itemComment], []);
    const contentStyle = React.useMemo(
      () => [styles.itemCommentContentWrapper, info.item.nbReplies > 0 && styles.itemCommentContentWrapperDeletedComment],
      [info.item.nbReplies],
    );

    return (
      <View style={itemStyle}>
        <View style={contentStyle}>
          <ContentDeletedItem {...info} />
        </View>
      </View>
    );
  };

  export const ReplyItem = ({
    canAddComment,
    onPressDelete,
    onPressEdit,
    ...info
  }: ListRenderItemInfo<CommentsThreadInternals.ReplyItem> & {
    canAddComment?: boolean;
    onPressEdit?: (item: CommentsThreadInternals.CommentItem | CommentsThreadInternals.ReplyItem, index: number) => void;
    onPressDelete?: (item: CommentsThreadInternals.CommentItem | CommentsThreadInternals.ReplyItem, index: number) => void;
  }) => {
    const { item } = info;
    const itemStyle = React.useMemo(() => [styles.itemCommon, styles.itemReply], []);
    const itemTreeStyle = React.useMemo(() => [styles.itemTreeCommon, styles.itemTreeReply], []);
    const itemAvatarStyle = React.useMemo(() => [styles.itemTreeCommon, styles.itemReplyAvatar], []);
    const itemTreeCurveStyle = React.useMemo(() => [styles.itemTreeDecoCurveCommon, styles.itemTreeDecoCurveTop], []);
    const itemTreeDecoStyle = React.useMemo(() => [styles.itemTreeDecoStraight], []);

    return (
      <View style={itemStyle}>
        <View style={itemTreeStyle}>
          <View style={itemTreeCurveStyle} />
          {item.hasReplies && <View style={itemTreeDecoStyle} />}
        </View>
        <View style={itemAvatarStyle}>
          <SingleAvatar size="xsm" userId={item.authorId} />
        </View>
        <View style={styles.itemReplyContentWrapper}>
          <ContentItem canAddComment={canAddComment} onPressEdit={onPressEdit} onPressDelete={onPressDelete} {...info} />
        </View>
      </View>
    );
  };

  export const DeletedReplyItem = (info: ListRenderItemInfo<CommentsThreadInternals.ReplyDeletedItem>) => {
    const { item } = info;
    const itemStyle = React.useMemo(() => [styles.itemCommon, styles.itemReply, styles.itemReplyDeleted], []);
    const itemTreeStyle = React.useMemo(() => [styles.itemTreeCommon, styles.itemTreeReply, styles.itemTreeReplyDeleted], []);
    const itemTreeCurveStyle = React.useMemo(() => [styles.itemTreeDecoCurveCommon, styles.itemTreeDecoCurveCenter], []);
    const itemTreeDecoStyle = React.useMemo(() => [styles.itemTreeDecoStraight], []);
    const itemTreeDecoCurveStyle = React.useMemo(() => [styles.itemTreeDecoStraight, styles.itemTreeDecoStraightTop], []);

    return (
      <View style={itemStyle}>
        <View style={itemTreeStyle}>
          <View style={itemTreeDecoCurveStyle} />
          <View style={itemTreeCurveStyle} />
          {item.hasReplies && <View style={itemTreeDecoStyle} />}
        </View>
        <View style={styles.itemReplyContentWrapper}>
          <ContentDeletedItem {...info} />
        </View>
      </View>
    );
  };

  export const ContentItemHeader = ({
    ...info
  }: ListRenderItemInfo<CommentsThreadInternals.CommentItem | CommentsThreadInternals.ReplyItem>) => {
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

  export const ContentItem = ({
    allowReplies,
    canAddComment,
    onPressDelete: _onPressDelete,
    onPressEdit: _onPressEdit,
    onPressReply: _onPressReply,
    ...info
  }: ListRenderItemInfo<CommentsThreadInternals.CommentItem | CommentsThreadInternals.ReplyItem> & {
    canAddComment?: boolean;
    onPressReply?: (item: CommentsThreadInternals.CommentItem, index: number) => void;
    onPressEdit?: (item: CommentsThreadInternals.CommentItem | CommentsThreadInternals.ReplyItem, index: number) => void;
    onPressDelete?: (item: CommentsThreadInternals.CommentItem | CommentsThreadInternals.ReplyItem, index: number) => void;
  } & Partial<Pick<CommentsThreadConfig, 'allowReplies'>>) => {
    const { index, item } = info;
    const session = useSelector(selectors.session);
    const isAuthor = session && item.authorId === session.user.id;
    const onPressReply = React.useCallback(() => {
      _onPressReply?.(item as CommentsThreadInternals.CommentItem, index);
    }, [_onPressReply, index, item]);
    const onPressEdit = React.useCallback(() => {
      _onPressEdit?.(item as CommentsThreadInternals.CommentItem | CommentsThreadInternals.ReplyItem, index);
    }, [_onPressEdit, index, item]);
    const onPressDelete = React.useCallback(() => {
      _onPressDelete?.(item as CommentsThreadInternals.CommentItem | CommentsThreadInternals.ReplyItem, index);
    }, [_onPressDelete, index, item]);
    return (
      <>
        <ContentItemHeader {...info} />
        <View>
          <SmallText style={styles.itemContentText}>{item.content}</SmallText>
          {session && canAddComment && (
            <View style={styles.itemContentButtons}>
              {allowReplies && item.type === CommentsThreadInternals.ITEM_COMMENT && (
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

  export const ContentDeletedItem = (
    _: ListRenderItemInfo<CommentsThreadInternals.CommentDeletedItem | CommentsThreadInternals.ReplyDeletedItem>,
  ) => {
    const containerStye = React.useMemo(() => [styles.itemContentText, styles.itemContentDeletedText], []);
    return <SmallItalicText style={containerStye}>{I18n.get('comment-deleted')}</SmallItalicText>;
  };

  export const RepliesEllipsisItem = ({
    onUnfoldReplies,
    ...info
  }: ListRenderItemInfo<CommentsThreadInternals.ReplyEllipsisItem> & {
    onUnfoldReplies?: (id: string, start: number, count: number) => void;
  }) => {
    const { item } = info;
    const itemStyle = React.useMemo(() => [styles.itemCommon, styles.itemReply], []);
    const itemTreeStyle = React.useMemo(() => [styles.itemTreeCommon, styles.itemTreeReply], []);
    const itemTreeCurveStyle = React.useMemo(() => [styles.itemTreeDecoCurveCommon, styles.itemTreeDecoCurveTop], []);
    const itemTreeDecoStyle = React.useMemo(() => [styles.itemTreeDecoStraight], []);
    const unfoldReplies = React.useCallback(() => {
      onUnfoldReplies?.(item.inReplyTo, item.start, item.count);
    }, [item.count, item.inReplyTo, item.start, onUnfoldReplies]);

    return (
      <View style={itemStyle}>
        <View style={itemTreeStyle}>
          <View style={itemTreeCurveStyle} />
          {item.hasReplies && <View style={itemTreeDecoStyle} />}
        </View>
        <View style={styles.itemRepliesUnfoldButtonWrapper}>
          <GhostButton
            onPress={unfoldReplies}
            testID="unfold-replies"
            text={I18n.get('comment-read-more-responses', { count: item.count })}
          />
        </View>
      </View>
    );
  };

  export const EditCommentItem = ({
    inputRef,
    listRef,
    onSubmit,
    ...info
  }: ListRenderItemInfo<CommentsThreadInternals.CommentItem> & {
    onSubmit?: CommentsThreadProps['onEdit'];
    inputRef?: CommentsThreadInternals.ItemProps['inputRef'];
  } & Pick<CommentsThreadInternals.ItemProps, 'listRef'>) => {
    const { item } = info;
    const itemStyle = React.useMemo(() => [styles.itemCommon, styles.itemComment], []);
    const itemTreeStyle = React.useMemo(() => [styles.itemTreeCommon, styles.itemTreeComment], []);
    const itemTreeDecoStyle = React.useMemo(() => [styles.itemTreeDecoStraight, styles.itemTreeDecoStraightComment], []);

    return (
      <View style={itemStyle}>
        <View style={itemTreeStyle}>
          <SingleAvatar size="xsm" userId={item.authorId} />
          {item.nbReplies > 0 && <View style={itemTreeDecoStyle} />}
        </View>
        <View style={styles.itemCommentContentWrapper}>
          <ContentItemHeader {...info} />
          <CommentsThreadEditForm onSubmit={onSubmit} ref={inputRef} listRef={listRef} {...info} />
        </View>
      </View>
    );
  };

  export const EditReplyItem = ({
    inputRef,
    listRef,
    onSubmit,
    ...info
  }: ListRenderItemInfo<CommentsThreadInternals.ReplyItem> & {
    onSubmit?: CommentsThreadProps['onEdit'];
    inputRef?: CommentsThreadInternals.ItemProps['inputRef'];
  } & Pick<CommentsThreadInternals.ItemProps, 'listRef'>) => {
    const { item } = info;
    const itemStyle = React.useMemo(() => [styles.itemCommon, styles.itemReply], []);
    const itemTreeStyle = React.useMemo(() => [styles.itemTreeCommon, styles.itemTreeReply], []);
    const itemAvatarStyle = React.useMemo(() => [styles.itemTreeCommon, styles.itemReplyAvatar], []);
    const itemTreeCurveStyle = React.useMemo(() => [styles.itemTreeDecoCurveCommon, styles.itemTreeDecoCurveTop], []);
    const itemTreeDecoStyle = React.useMemo(() => [styles.itemTreeDecoStraight], []);

    return (
      <View style={itemStyle}>
        <View style={itemTreeStyle}>
          <View style={itemTreeCurveStyle} />
          {item.hasReplies && <View style={itemTreeDecoStyle} />}
        </View>
        <View style={itemAvatarStyle}>
          <SingleAvatar size="xsm" userId={item.authorId} />
        </View>
        <View style={styles.itemReplyContentWrapper}>
          <ContentItemHeader {...info} />
          <CommentsThreadEditForm onSubmit={onSubmit} ref={inputRef} listRef={listRef} {...info} />
        </View>
      </View>
    );
  };

  export const Item = ({
    allowReplies,
    canAddComment,
    inputRef,
    listRef,
    onPressDelete,
    onPressEdit,
    onPressReply,
    onSendEdit,
    onUnfoldReplies,
    ...info
  }: CommentsThreadInternals.ItemProps) => {
    const [editContext] = React.useContext(CommentsThreadContext);

    if (info.item.type === CommentsThreadInternals.ITEM_COMMENT) {
      return editContext.editId === info.item.id ? (
        <EditCommentItem
          {...(info as ListRenderItemInfo<CommentsThreadInternals.CommentItem>)}
          onSubmit={onSendEdit}
          inputRef={inputRef}
          listRef={listRef}
        />
      ) : (
        <CommentItem
          allowReplies={allowReplies}
          canAddComment={canAddComment}
          onPressReply={onPressReply}
          onPressEdit={onPressEdit}
          onPressDelete={onPressDelete}
          {...(info as ListRenderItemInfo<CommentsThreadInternals.CommentItem>)}
        />
      );
    } else if (info.item.type === CommentsThreadInternals.ITEM_REPLY) {
      return editContext.editId === info.item.id ? (
        <EditReplyItem
          {...(info as ListRenderItemInfo<CommentsThreadInternals.ReplyItem>)}
          onSubmit={onSendEdit}
          inputRef={inputRef}
          listRef={listRef}
        />
      ) : (
        <ReplyItem
          canAddComment={canAddComment}
          onPressEdit={onPressEdit}
          onPressDelete={onPressDelete}
          {...(info as ListRenderItemInfo<CommentsThreadInternals.ReplyItem>)}
        />
      );
    } else if (info.item.type === CommentsThreadInternals.ITEM_COMMENT_DELETED) {
      return <DeletedCommentItem {...(info as ListRenderItemInfo<CommentsThreadInternals.CommentDeletedItem>)} />;
    } else if (info.item.type === CommentsThreadInternals.ITEM_REPLY_DELETED) {
      return <DeletedReplyItem {...(info as ListRenderItemInfo<CommentsThreadInternals.ReplyDeletedItem>)} />;
    } else if (info.item.type === CommentsThreadInternals.ITEM_REPLY_ELLIPSIS) {
      return (
        <RepliesEllipsisItem
          {...(info as ListRenderItemInfo<CommentsThreadInternals.ReplyEllipsisItem>)}
          onUnfoldReplies={onUnfoldReplies}
        />
      );
    } else {
      console.warn(`[CommentsThread]: Unknown item type "${(info.item as { type: any }).type}" at index ${info.index}`);
      return null;
    }
  };
}
