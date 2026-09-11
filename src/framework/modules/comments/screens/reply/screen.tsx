import React from 'react';

import { I18n } from '~/app/i18n';
import { ModuleScreenProps } from '~/app/navigation/types';
import { modalScreenOptions } from '~/app/navigation/util';
import { EmptyContentScreen } from '~/framework/components/empty-screens';
import { withSession } from '~/framework/modules/auth/util';
import CommentsThreadTemplate from '~/framework/modules/comments/components/comments-thread';
import { useCommentsThreadStore } from '~/framework/modules/comments/store';

export const CommentsThreadReplyScreenOptions = modalScreenOptions<'comments/reply'>('modal', () => ({
  title: I18n.get('comments-reply-title'),
}));
export const CommentsThreadReplyScreen = withSession<ModuleScreenProps<'comments/reply'>>(function ({
  navigation,
  route: {
    params: { commentId },
  },
}) {
  // Setup zustand store for reply screen
  const _data = useCommentsThreadStore(s => s.data);
  const refreshControl = useCommentsThreadStore(s => s.refreshControl);
  const resourceId = useCommentsThreadStore(s => s.resourceId);

  const data = React.useMemo(() => _data && _data.filter(item => item.id === commentId), [_data, commentId]);

  const onSubmit = React.useCallback(async () => {}, []);

  if (!data || !resourceId) {
    return <EmptyContentScreen />;
  }

  return (
    <CommentsThreadTemplate
      allowReplies={false}
      navigation={navigation}
      onSubmit={onSubmit}
      canAddComment
      data={data}
      refreshControl={refreshControl}
    />
  );
});
