import React from 'react';

import { ExtractState } from 'zustand';

import { useNavigation } from '~/app/navigation-new';
import { CommentsTree, CommentsTreeProps } from '~/framework/modules/comments/components/comments-tree';
import { useCommentsThreadStore } from '~/framework/modules/comments/store';

/**
 * The comments of a resource, under it (`ListHeaderComponent`). Replying to a comment opens it in the modal `comments/reply`, which
 * reads the data and the callbacks given here (`useCommentsThreadStore`).
 */
export function ResourceWithCommentsTemplate({
  data,
  onDelete,
  onEdit,
  onSubmit,
  refreshControl,
  ...props
}: CommentsTreeProps & Pick<ExtractState<typeof useCommentsThreadStore>, 'refreshControl'>) {
  const navigation = useNavigation();

  // Setup zustand store for reply screen
  const setData = useCommentsThreadStore(s => s.setData);
  const setRefreshControl = useCommentsThreadStore(s => s.setRefreshControl);
  const setCallbacks = useCommentsThreadStore(s => s.setCallbacks);
  React.useEffect(() => {
    setData(data);
    setRefreshControl(refreshControl);
    setCallbacks(onSubmit, onEdit, onDelete);
    // No need to cleanup stored data : resourceId serves as key to check that it belongs to the right screen
  }, [data, onDelete, onEdit, onSubmit, refreshControl, setCallbacks, setData, setRefreshControl]);

  const onReply = React.useCallback<NonNullable<CommentsTreeProps['onReply']>>(
    async commentId => {
      navigation.navigate('comments/reply', { commentId });
    },
    [navigation],
  );

  return (
    <CommentsTree
      data={data}
      refreshControl={refreshControl}
      onSubmit={onSubmit}
      onDelete={onDelete}
      onEdit={onEdit}
      onReply={onReply}
      {...props}
    />
  );
}
