import React from 'react';

import { ExtractState } from 'zustand';

import CommentsThread, { CommentsThreadProps } from '~/framework/modules/comments/components/comments-thread';
import { useCommentsThreadStore } from '~/framework/modules/comments/store';

export function ResourceWithCommentsTemplate({
  data,
  onDelete,
  onEdit,
  onSubmit,
  refreshControl,
  ...props
}: CommentsThreadProps & Pick<ExtractState<typeof useCommentsThreadStore>, 'refreshControl'>) {
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

  return (
    <CommentsThread
      data={data}
      refreshControl={refreshControl}
      onSubmit={onSubmit}
      onDelete={onDelete}
      onEdit={onEdit}
      {...props}
    />
  );
}
