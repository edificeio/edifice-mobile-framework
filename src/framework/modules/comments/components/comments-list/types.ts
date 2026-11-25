import { LOADING_ITEM_DATA, PaginatedFlatListProps } from '~/framework/components/list/paginated-list';
import {
  CommentsThreadInternalProps,
  CommentsThreadInternals,
} from '~/framework/modules/comments/components/comments-thread-internal';
import * as CommentsThread from '~/framework/modules/comments/types';
import { AnimatedFlatListProps } from '~/framework/util/reanimated';

export type PaginatedCommentsListProps<
  CustomListProps extends AnimatedFlatListProps<CommentsThreadInternals.Item | typeof LOADING_ITEM_DATA> = AnimatedFlatListProps<
    CommentsThreadInternals.Item | typeof LOADING_ITEM_DATA
  >,
> = Omit<CommentsThreadInternalProps<CustomListProps>, 'onUnfoldReplies' | 'data' | 'canAddReply'> & {
  data: (
    | Omit<CommentsThread.CommentItem, 'replies'>
    | Omit<CommentsThread.CommentDeletedItem, 'replies'>
    | typeof LOADING_ITEM_DATA
  )[];
} & Pick<
    PaginatedFlatListProps<
      Omit<CommentsThread.CommentItem, 'replies'> | Omit<CommentsThread.CommentDeletedItem, 'replies'> | typeof LOADING_ITEM_DATA
    >,
    'placeholderNumberOfRows'
  >;
