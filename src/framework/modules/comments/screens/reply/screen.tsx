/**
 * A comment with all its replies, to reply to it: opened from the template of the resource (`ResourceWithCommentsTemplate`), which
 * gives it its data and its callbacks through the store (`useCommentsThreadStore`).
 */
import React from 'react';

import type { StaticScreenProps } from '@react-navigation/native';

import { defineModal } from '~/app/navigation-new';
import { EmptyContentScreen } from '~/framework/components/empty-screens';
import { CommentsTree, CommentsTreeProps } from '~/framework/modules/comments/components/comments-tree';
import { useCommentsThreadStore } from '~/framework/modules/comments/store';
import type { CommentItem } from '~/framework/modules/comments/types';
import { withSession } from '~/modules/auth/hoc';
import { I18n } from '~/util/i18n';

/** The comment replied to. A `type`, not an interface: `StaticScreenProps` needs a `Record`. */
export type CommentsReplyScreenNavParams = {
  commentId: CommentItem['id'];
};

const CommentsThreadReplyScreen = withSession<StaticScreenProps<CommentsReplyScreenNavParams>>(function ({
  route: {
    params: { commentId },
  },
}) {
  // Data and callbacks of the resource, set by its template
  const _data = useCommentsThreadStore(s => s.data);
  const refreshControl = useCommentsThreadStore(s => s.refreshControl);
  const _onSubmit = useCommentsThreadStore(s => s.onSubmit);
  const onEdit = useCommentsThreadStore(s => s.onEdit);
  const onDelete = useCommentsThreadStore(s => s.onDelete);
  const onSubmit = React.useCallback<NonNullable<CommentsTreeProps['onSubmit']>>(
    data => {
      if (!_onSubmit) throw new Error('[CommentsThread] No onSubmit callback provided.');
      return _onSubmit?.(data, commentId);
    },
    [_onSubmit, commentId],
  );

  const data = React.useMemo(() => _data?.filter(item => item.id === commentId), [_data, commentId]);

  if (!data) {
    return <EmptyContentScreen />;
  }

  return (
    <CommentsTree
      onSubmit={onSubmit}
      onEdit={onEdit}
      onDelete={onDelete}
      canAddComment
      canAddReply
      data={data}
      refreshControl={refreshControl}
    />
  );
});
CommentsThreadReplyScreen.displayName = 'CommentsThreadReplyScreen';

export default defineModal({
  options: () => ({ title: I18n.get('comments-reply-title') }),
  screen: CommentsThreadReplyScreen,
});
