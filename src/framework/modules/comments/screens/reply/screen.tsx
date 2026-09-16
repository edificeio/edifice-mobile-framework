import React from 'react';

import { I18n } from '~/app/i18n';
import { ModuleScreenProps } from '~/app/navigation/types';
import { modalScreenOptions } from '~/app/navigation/util';
import { EmptyContentScreen } from '~/framework/components/empty-screens';
import { withSession } from '~/framework/modules/auth/util';
import CommentsThread, { CommentsThreadProps } from '~/framework/modules/comments/components/comments-thread';
import { useCommentsThreadStore } from '~/framework/modules/comments/store';

export const CommentsThreadReplyScreenOptions = modalScreenOptions<'comments/reply'>('modal', () => ({
  title: I18n.get('comments-reply-title'),
}));
export const CommentsThreadReplyScreen = withSession<ModuleScreenProps<'comments/reply'>>(function ({
  navigation,
  route,
  route: {
    params: { commentId },
  },
}) {
  // Setup zustand store for reply screen
  const _data = useCommentsThreadStore(s => s.data);
  const refreshControl = useCommentsThreadStore(s => s.refreshControl);
  const _onSubmit = useCommentsThreadStore(s => s.onSubmit);
  const onEdit = useCommentsThreadStore(s => s.onEdit);
  const onDelete = useCommentsThreadStore(s => s.onDelete);
  const onSubmit = React.useCallback<NonNullable<CommentsThreadProps['onSubmit']>>(
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
    <CommentsThread
      allowReplies={false}
      navigation={navigation}
      route={route}
      onSubmit={onSubmit}
      onEdit={onEdit}
      onDelete={onDelete}
      canAddComment
      data={data}
      refreshControl={refreshControl}
    />
  );
});
