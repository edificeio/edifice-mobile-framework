/**
 * SocialResourceViewer hooks
 * Data management hook for comments & responses
 */

import React from 'react';

import { SocialResourceViewer, SocialResourceViewerInternals } from './types';

const DEFAULT_CONFIG: SocialResourceViewer.CommentsConfig = {
  responsesPageSize: 10,
  responsesStartSize: 2,
  showDeletedItems: 'children',
};

/**
 * Returns only a portion of the full data to display.
 * @param data
 */
export const useSocialCommentsData = (
  data: SocialResourceViewer.Props['data'],
  config?: Partial<SocialResourceViewer.CommentsConfig>,
  newResponse?: Partial<Pick<SocialResourceViewerInternals.ContextState, 'newResponseId' | 'newResponseValue'>>,
) => {
  // By default, all comments are displayed.
  // For each comment, only first 2 repsonses are show. A user can load the further responses 10 by 10.
  // When posting a new reponse, it will be shown directly, after the others (visible or not).

  const {
    responsesPageSize = DEFAULT_CONFIG.responsesPageSize,
    responsesStartSize = DEFAULT_CONFIG.responsesStartSize,
    showDeletedItems = DEFAULT_CONFIG.showDeletedItems,
  } = config ?? DEFAULT_CONFIG;

  const [displayedResponsesRangesByComment, setDisplayedResponsesRangesByComment] = React.useState<
    Record<
      (SocialResourceViewer.CommentItem | SocialResourceViewer.CommentItemDeleted)['id'],
      [number, number][] // [start, nb]
    >
  >({});

  // Note: this is a callback to generate array, not a memoized value, because it will be mutated after for each comment.
  const getDefaultResponseRanges = React.useCallback(() => [[0, responsesStartSize]], [responsesStartSize]);

  const showResponses = React.useCallback(
    (
      id: keyof typeof displayedResponsesRangesByComment,
      start: ArrayElement<(typeof displayedResponsesRangesByComment)[number]>[0],
      count: ArrayElement<(typeof displayedResponsesRangesByComment)[number]>[1],
    ) => {
      setDisplayedResponsesRangesByComment(oldRanges => ({
        ...oldRanges,
        [id]: _addRange(oldRanges[id] ?? getDefaultResponseRanges(), start, Math.min(count, responsesPageSize)),
      }));
    },
    [responsesPageSize, getDefaultResponseRanges],
  );

  const [filteredData, totalItems] = React.useMemo(() => {
    let total = 0;
    const ret: typeof data = [];
    for (const comment of data) {
      if ('deleted' in comment && showDeletedItems === 'never') continue;
      const children: typeof comment.responses = [];
      for (const response of comment.responses) {
        if ('deleted' in response && showDeletedItems !== 'always') continue;
        children.push(response);
        if ('count' in response) total += response.count;
        else ++total;
      }
      if (!('deleted' in comment) || children.length || showDeletedItems === 'always') {
        if (!('deleted' in comment)) ++total;
        comment.responses = children;
        ret.push(comment);
      }
    }
    return [ret, total];
  }, [data, showDeletedItems]);

  const dataWithRanges = React.useMemo(() => {
    return filteredData.map(comment => ({
      ...comment,
      responses: _buildResponses(
        comment.responses,
        displayedResponsesRangesByComment[comment.id] ?? getDefaultResponseRanges(),
        (gapStart, gapSize) => ({ count: gapSize, start: gapStart }) as SocialResourceViewer.ResponseItemEllipsis,
      ),
    }));
  }, [filteredData, displayedResponsesRangesByComment, getDefaultResponseRanges]);

  // Flatten & consolidate data
  const flatData = React.useMemo<SocialResourceViewerInternals.Item[]>(() => {
    const ret: SocialResourceViewerInternals.Item[] = [];
    for (let commentIndex = 0; commentIndex < dataWithRanges.length; ++commentIndex) {
      const { responses, ...commentItem } = dataWithRanges[commentIndex];
      const hasResponseForm = commentItem.id === newResponse?.newResponseId;
      const nbResponses = responses.length + (hasResponseForm ? 1 : 0);
      // Add comment item here
      if ('deleted' in commentItem) {
        ret.push({
          ...commentItem,
          nbResponses,
          type: SocialResourceViewerInternals.ITEM_COMMENT_DELETED,
        });
      } else {
        ret.push({
          ...commentItem,
          nbResponses,
          type: SocialResourceViewerInternals.ITEM_COMMENT,
        });
      }
      // Add all responses items & ellipsis here
      for (let responseIndex = 0; responseIndex < responses.length; ++responseIndex) {
        const responseItem = responses[responseIndex];
        const responseData = {
          hasResponses: responseIndex < responses.length - 1 || hasResponseForm,
          inReplyTo: commentItem.id,
          inReplyToIndex: commentIndex,
        };
        if ('count' in responseItem) {
          ret.push({
            ...responseItem,
            ...responseData,
            type: SocialResourceViewerInternals.ITEM_RESPONSE_ELLIPSIS,
          });
        } else if ('deleted' in responseItem) {
          ret.push({
            ...responseItem,
            ...responseData,
            type: SocialResourceViewerInternals.ITEM_RESPONSE_DELETED,
          });
        } else {
          ret.push({
            ...responseItem,
            ...responseData,
            type: SocialResourceViewerInternals.ITEM_RESPONSE,
          });
        }
      }
      // Add new response form here
      if (hasResponseForm) {
        ret.push({
          inReplyTo: commentItem.id,
          inReplyToIndex: commentIndex,
          type: SocialResourceViewerInternals.ITEM_ADD_RESPONSE,
          value: newResponse?.newResponseValue ?? '',
          // ToDo: get isRichContent from config here or something
        });
      }
    }
    return ret;
  }, [dataWithRanges, newResponse?.newResponseId, newResponse?.newResponseValue]);

  return { filteredData: dataWithRanges, flatData, showResponses, totalItems };
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

const _buildResponses = <ItemT, GapT>(
  responses: ItemT[],
  ranges: [number, number][],
  generateGap: (gapStart: number, gapSize: number) => GapT,
): (ItemT | GapT)[] => {
  const ret: (ItemT | GapT)[] = [];
  let currentEnd = 0;
  const total = responses.length;
  for (const range of ranges) {
    const start = range[0];
    const end = range[0] + range[1];
    if (currentEnd < start) {
      ret.push(generateGap(currentEnd, start - currentEnd));
    }
    for (let i = start; i < end; ++i) {
      i < total && ret.push(responses[i]);
    }
    currentEnd = end;
  }
  if (currentEnd < responses.length) {
    ret.push(generateGap(currentEnd, total - currentEnd));
  }
  return ret;
};

// const _isInRanges = (ranges: [number, number][], index: number) => {
//   for (const range of ranges) {
//     if (index < range[0]) return false;
//     if (index < range[0] + range[1]) return true;
//   }
//   return false;
// };
