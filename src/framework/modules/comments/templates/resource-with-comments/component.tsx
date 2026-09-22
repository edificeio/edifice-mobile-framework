import React from 'react';

import { ExtractState } from 'zustand';

import { AllModulesNavigationParams, ModuleScreenProps } from '~/app/navigation/types';
import CommentsThread, { CommentsThreadProps } from '~/framework/modules/comments/components/comments-thread';
import { useCommentsThreadStore } from '~/framework/modules/comments/store';

export function ResourceWithCommentsTemplate<ScreenName extends keyof AllModulesNavigationParams>({
  data,
  navigation,
  onDelete,
  onEdit,
  onSubmit,
  refreshControl,
  ...props
}: CommentsThreadProps & Pick<ExtractState<typeof useCommentsThreadStore>, 'refreshControl'> & ModuleScreenProps<ScreenName>) {
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

  const onReply = React.useCallback<NonNullable<CommentsThreadProps['onReply']>>(
    async commentId => {
      navigation.navigate('comments/reply', { commentId });
    },
    [navigation],
  );

  return (
    <CommentsThread
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
