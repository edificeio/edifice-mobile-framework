import { FlatListProps } from 'react-native';

import { create } from 'zustand';

import { CommentsThreadInternals, CommentsThreadProps } from './components/comments-thread';

interface CommentsThreadStore {
  // data
  resourceId: string | number | undefined;
  data: CommentsThreadProps['data'] | undefined;
  refreshControl: FlatListProps<CommentsThreadInternals.Item>['refreshControl'];

  // Actions
  setResourceId: (resourceId: CommentsThreadStore['resourceId']) => void;
  setData: (comments: CommentsThreadStore['data']) => void;
  setRefreshControl: (refreshControl: CommentsThreadStore['refreshControl']) => void;
  // refresh: () => Promise<void>;
  clear: () => void;
}

const initialData: Pick<CommentsThreadStore, 'data' | 'resourceId' | 'refreshControl'> = {
  data: undefined,
  refreshControl: undefined,
  resourceId: undefined,
};

export const useCommentsThreadStore = create<CommentsThreadStore>()(set => ({
  ...initialData,
  clear: () => set(initialData),
  setData: data => set({ data }),
  setRefreshControl: refreshControl => set({ refreshControl }),
  setResourceId: resourceId => set({ resourceId }),
}));
