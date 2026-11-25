import {
  CommentsThreadConfig,
  CommentsThreadInternalProps,
  CommentsThreadInternals,
} from '~/framework/modules/comments/components/comments-thread-internal';
import * as CommentsThread from '~/framework/modules/comments/types';
import { AnimatedFlatListProps } from '~/framework/util/reanimated';

export type CommentsTreeProps<
  CustomListProps extends AnimatedFlatListProps<CommentsThreadInternals.Item> = AnimatedFlatListProps<CommentsThreadInternals.Item>,
> = Omit<CommentsThreadInternalProps<CustomListProps>, 'onUnfoldReplies' | 'data'> & {
  data: (CommentsThread.CommentItem | CommentsThread.CommentDeletedItem)[];
} & Partial<CommentsThreadConfig>;
