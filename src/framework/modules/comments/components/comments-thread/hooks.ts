/**
 * CommentsThread hooks
 * Data management hook for comments & replies
 */

import React from 'react';

import { CommentDeletedItem, CommentItem, ReplyEllipsisItem } from '~/framework/modules/comments/types';

import { CommentsThreadConfig, CommentsThreadInternals, CommentsThreadProps } from './types';

export const DEFAULT_CONFIG: CommentsThreadConfig = {
  allowReplies: true,
  repliesPageSize: 10,
  repliesStartSize: 2,
  showDeletedItems: 'children',
};

/**
 * Returns only a portion of the full data to display.
 * @param data
 */
export const useCommentsThreadData = (
  data: CommentsThreadProps['data'],
  editContext: CommentsThreadInternals.ContextState,
  config?: Partial<CommentsThreadConfig>,
) => {
  // By default, all comments are displayed.
  // For each comment, only first 2 repsonses are show. A user can load the further replies 10 by 10.
  // When posting a new reponse, it will be shown directly, after the others (visible or not).

  const {
    repliesPageSize = DEFAULT_CONFIG.repliesPageSize,
    repliesStartSize = DEFAULT_CONFIG.repliesStartSize,
    showDeletedItems = DEFAULT_CONFIG.showDeletedItems,
  } = config ?? DEFAULT_CONFIG;

  const [displayedRepliesRangesByComment, setDisplayedRepliesRangesByComment] = React.useState<
    Record<
      (CommentItem | CommentDeletedItem)['id'],
      [number, number][] // [start, nb]
    >
  >({});

  // Note: this is a callback to generate array, not a memoized value, because it will be mutated after for each comment.
  const getDefaultRepliesRanges = React.useCallback(() => [[0, repliesStartSize]], [repliesStartSize]);

  const unfoldReplies = React.useCallback(
    (
      id: keyof typeof displayedRepliesRangesByComment,
      start: ArrayElement<(typeof displayedRepliesRangesByComment)[number]>[0],
      count: ArrayElement<(typeof displayedRepliesRangesByComment)[number]>[1],
    ) => {
      setDisplayedRepliesRangesByComment(oldRanges => ({
        ...oldRanges,
        [id]: _addRange(oldRanges[id] ?? getDefaultRepliesRanges(), start, Math.min(count, repliesPageSize)),
      }));
    },
    [repliesPageSize, getDefaultRepliesRanges],
  );

  const [filteredData, totalItems] = React.useMemo(() => {
    let total = 0;
    const ret: typeof data = [];
    for (const comment of data) {
      if ('deleted' in comment && showDeletedItems === 'never') continue;
      const children: typeof comment.replies = [];
      for (const reply of comment.replies) {
        if ('deleted' in reply && showDeletedItems !== 'always') continue;
        children.push(reply);
        if ('count' in reply) total += reply.count;
        else ++total;
      }
      if (!('deleted' in comment) || children.length || showDeletedItems === 'always') {
        if (!('deleted' in comment)) ++total;
        comment.replies = children;
        ret.push(comment);
      }
    }
    return [ret, total];
  }, [data, showDeletedItems]);

  const dataWithRanges = React.useMemo(() => {
    return filteredData.map(comment => ({
      ...comment,
      replies: _buildReplies(
        comment.replies,
        displayedRepliesRangesByComment[comment.id] ?? getDefaultRepliesRanges(),
        (gapStart, gapSize) => ({ count: gapSize, start: gapStart }) as ReplyEllipsisItem,
      ),
    }));
  }, [filteredData, displayedRepliesRangesByComment, getDefaultRepliesRanges]);

  // Flatten & consolidate data
  const flatData = React.useMemo<CommentsThreadInternals.Item[]>(() => {
    const ret: CommentsThreadInternals.Item[] = [];
    for (let commentIndex = 0; commentIndex < dataWithRanges.length; ++commentIndex) {
      const { replies, ...commentItem } = dataWithRanges[commentIndex];
      // Add comment item here
      if ('deleted' in commentItem) {
        ret.push({
          ...commentItem,
          nbReplies: replies.length,
          type: CommentsThreadInternals.ITEM_COMMENT_DELETED,
        });
      } else {
        ret.push({
          ...commentItem,
          nbReplies: replies.length,
          type: CommentsThreadInternals.ITEM_COMMENT,
        });
      }
      // Add all replies items & ellipsis here
      for (let replyIndex = 0; replyIndex < replies.length; ++replyIndex) {
        const replyItem = replies[replyIndex];
        const replyData = {
          hasReplies: replyIndex < replies.length - 1,
          inReplyTo: commentItem.id,
          inReplyToIndex: commentIndex,
        };
        if ('count' in replyItem) {
          ret.push({
            ...replyItem,
            ...replyData,
            type: CommentsThreadInternals.ITEM_REPLY_ELLIPSIS,
          });
        } else if ('deleted' in replyItem) {
          ret.push({
            ...replyItem,
            ...replyData,
            type: CommentsThreadInternals.ITEM_REPLY_DELETED,
          });
        } else {
          ret.push({
            ...replyItem,
            ...replyData,
            type: CommentsThreadInternals.ITEM_REPLY,
          });
        }
      }
    }
    return ret;
  }, [dataWithRanges]);

  return { filteredData: dataWithRanges, flatData, totalItems, unfoldReplies };
};

const _addRange = (
  ranges: [number, number][],
  start: ArrayElement<typeof ranges>[0],
  count: ArrayElement<typeof ranges>[1],
): typeof ranges => {
  const newEnd = start + count;

  let mergedStart = start;
  let mergedEnd = newEnd;
  const before: [number, number][] = [];
  const after: [number, number][] = [];

  for (const [rangeStart, rangeCount] of ranges) {
    const rangeEnd = rangeStart + rangeCount;

    if (rangeStart <= newEnd && rangeEnd >= start) {
      // Merge with
      mergedStart = Math.min(mergedStart, rangeStart);
      mergedEnd = Math.max(mergedEnd, rangeEnd);
    } else if (rangeEnd < start) {
      // Push before
      before.push([rangeStart, rangeCount]);
    } else {
      // Push after
      after.push([rangeStart, rangeCount]);
    }
  }

  return [...before, [mergedStart, mergedEnd - mergedStart], ...after];
};

const _buildReplies = <ItemT, GapT>(
  replies: ItemT[],
  ranges: [number, number][],
  generateGap: (gapStart: number, gapSize: number) => GapT,
): (ItemT | GapT)[] => {
  const ret: (ItemT | GapT)[] = [];
  let currentEnd = 0;
  const total = replies.length;
  for (const range of ranges) {
    const start = range[0];
    const end = range[0] + range[1];
    if (currentEnd < start) {
      ret.push(generateGap(currentEnd, start - currentEnd));
    }
    for (let i = start; i < end; ++i) {
      i < total && ret.push(replies[i]);
    }
    currentEnd = end;
  }
  if (currentEnd < replies.length) {
    ret.push(generateGap(currentEnd, total - currentEnd));
  }
  return ret;
};
