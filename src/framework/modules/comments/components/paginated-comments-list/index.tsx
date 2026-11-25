import React from 'react';

import CommentsThreadInternal, { CommentsThreadInternals } from '~/framework/modules/comments/components/comments-thread-internal';

import { CommentsListProps } from './types';

export * from './types';

export function CommentsList({ data, ...props }: CommentsListProps) {
  const flatData = React.useMemo<(CommentsThreadInternals.CommentItem | CommentsThreadInternals.CommentDeletedItem)[]>(
    () =>
      data.map(item =>
        'deleted' in item
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

  return <CommentsThreadInternal data={flatData} canAddReply={false} {...props} />;
}
