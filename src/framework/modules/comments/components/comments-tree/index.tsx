import CommentsThreadInternal from '~/framework/modules/comments/components/comments-thread-internal';
import { useCommentsThreadData } from '~/framework/modules/comments/components/comments-tree/hooks';

import { CommentsTreeProps } from './types';

export * from './types';

export function CommentsTree({
  data,
  repliesPageSize,
  repliesStartSize,
  showDeletedItems,
  showReplies,
  ...props
}: CommentsTreeProps) {
  const { flatData, unfoldReplies } = useCommentsThreadData(data, {
    repliesPageSize,
    repliesStartSize,
    showDeletedItems,
    showReplies,
  });

  return <CommentsThreadInternal data={flatData} onUnfoldReplies={unfoldReplies} {...props} />;
}
