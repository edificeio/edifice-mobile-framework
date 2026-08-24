/**
 * SocialResourceViewer hooks
 * Data management hook for comments & responses
 */

import React from 'react';

import { SocialResourceViewer, SocialResourceViewerInternals } from './types';

const RESPONSE_COUNT_LOAD_START = 2;
const RESPONSE_COUNT_LOAD_PAGE = 10;

/**
 * Returns only a portion of the full data to display.
 * @param data
 */
export const useSocialCommentsData = (
  data: SocialResourceViewer.Props['data'],
  config: { responsesStart: number; responsesPage: number } = {
    responsesPage: RESPONSE_COUNT_LOAD_PAGE,
    responsesStart: RESPONSE_COUNT_LOAD_START,
  },
) => {
  // By default, all comments are displayed.
  // For each comment, only first 2 repsonses are show. A user can load the further responses 10 by 10.
  // When posting a new reponse, it will be shown directly, after the others (visible or not).

  const [displayedResponsesRangesByComment, setDisplayedResponsesRangesByComment] = React.useState<
    Record<
      (SocialResourceViewer.CommentItem | SocialResourceViewer.CommentItemDeleted)['id'],
      [number, number][] // [start, nb]
    >
  >(() =>
    data.reduce(
      (acc, item) => ({
        ...acc,
        [item.id]: [[0, config.responsesStart]],
      }),
      {},
    ),
  );

  const showResponses = React.useCallback(
    (
      id: keyof typeof displayedResponsesRangesByComment,
      start: ArrayElement<(typeof displayedResponsesRangesByComment)[number]>[0],
      count: ArrayElement<(typeof displayedResponsesRangesByComment)[number]>[1],
    ) => {
      setDisplayedResponsesRangesByComment(oldRanges => ({
        ...oldRanges,
        [id]: _addRange(oldRanges[id] ?? [], start, Math.min(count, config.responsesPage)),
      }));
    },
    [config.responsesPage],
  );

  const filteredData = React.useMemo(() => {
    return data.map(comment => ({
      ...comment,
      responses: _buildResponses(
        comment.responses,
        displayedResponsesRangesByComment[comment.id],
        (gapStart, gapSize) => ({ count: gapSize, start: gapStart }) as SocialResourceViewer.ResponseItemEllipsis,
      ),
    }));
  }, [data, displayedResponsesRangesByComment]);

  // Flatten & consolidate data
  const flatData = React.useMemo<SocialResourceViewerInternals.Item[]>(() => {
    const ret: SocialResourceViewerInternals.Item[] = [];
    for (let commentIndex = 0; commentIndex < filteredData.length; ++commentIndex) {
      const { responses, ...commentItem } = filteredData[commentIndex];
      if ('deleted' in commentItem) {
        ret.push({
          ...commentItem,
          hasResponses: responses.length > 0,
          type: SocialResourceViewerInternals.ITEM_COMMENT_DELETED,
        });
      } else {
        ret.push({
          ...commentItem,
          hasResponses: responses.length > 0,
          type: SocialResourceViewerInternals.ITEM_COMMENT,
        });
      }
      for (let responseIndex = 0; responseIndex < responses.length; ++responseIndex) {
        const responseItem = responses[responseIndex];
        const responseData = {
          hasResponses: responseIndex < responses.length - 1,
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
    }
    return ret;
  }, [filteredData]);

  return { filteredData, flatData, showResponses };
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
