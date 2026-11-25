import React from 'react';

import { AnimatedPaginatedFlatList, LOADING_ITEM_DATA, PaginatedFlatListProps } from '~/framework/components/list/paginated-list';
import { BodyText } from '~/framework/components/text';
import CommentsThreadInternal, { CommentsThreadInternals } from '~/framework/modules/comments/components/comments-thread-internal';

import { PaginatedCommentsListProps } from './types';

export * from './types';

export function PaginatedCommentsList({ data, ...props }: PaginatedCommentsListProps) {
  const flatData = React.useMemo<
    (CommentsThreadInternals.CommentItem | CommentsThreadInternals.CommentDeletedItem | typeof LOADING_ITEM_DATA)[]
  >(
    () =>
      data.map(item =>
        item === LOADING_ITEM_DATA
          ? item
          : 'deleted' in item
            ? {
                nbReplies: 0,
                type: CommentsThreadInternals.ITEM_COMMENT_DELETED,
                ...item,
              }
            : {
                nbReplies: 0,
                type: CommentsThreadInternals.ITEM_COMMENT,
                ...item,
              },
      ),
    [data],
  );

  const renderPlaceholderItem = React.useCallback<
    NonNullable<
      PaginatedFlatListProps<
        CommentsThreadInternals.CommentItem | CommentsThreadInternals.CommentDeletedItem
      >['renderPlaceholderItem']
    >
  >(({ index }) => <BodyText>LOADING {index}</BodyText>, []);

  return (
    <CommentsThreadInternal
      AnimatedListComponent={AnimatedPaginatedFlatList}
      renderPlaceholderItem={renderPlaceholderItem}
      data={flatData}
      {...props}
    />
  );
}
