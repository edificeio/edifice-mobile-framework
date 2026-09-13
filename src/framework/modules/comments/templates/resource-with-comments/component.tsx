import React from 'react';

import { ExtractState } from 'zustand';

import CommentsThreadTemplate, { CommentsThreadProps } from '~/framework/modules/comments/components/comments-thread';
import { useCommentsThreadStore } from '~/framework/modules/comments/store';

export function ResourceWithComments({
  data,
  onSubmit,
  refreshControl,
  resourceId,
  ...props
}: CommentsThreadProps & Pick<ExtractState<typeof useCommentsThreadStore>, 'refreshControl' | 'resourceId'>) {
  // Setup zustand store for reply screen
  const setData = useCommentsThreadStore(s => s.setData);
  const setRefreshControl = useCommentsThreadStore(s => s.setRefreshControl);
  const setResourceId = useCommentsThreadStore(s => s.setResourceId);
  const setOnSubmit = useCommentsThreadStore(s => s.setOnSubmit);
  React.useEffect(() => {
    setData(data);
    setRefreshControl(refreshControl);
    setResourceId(resourceId);
    setOnSubmit(onSubmit);
    // No need to cleanup stored data : resourceId serves as key to check that it belongs to the right screen
  }, [data, onSubmit, refreshControl, resourceId, setData, setOnSubmit, setRefreshControl, setResourceId]);

  return <CommentsThreadTemplate data={data} refreshControl={refreshControl} onSubmit={onSubmit} {...props} />;
}
