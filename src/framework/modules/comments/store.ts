import { FlatListProps } from 'react-native';

import { create } from 'zustand';

import { CommentsThreadInternals, CommentsThreadProps } from './components/comments-thread';

interface CommentsThreadStore {
  // data
  resourceId: string | number | undefined;
  data: CommentsThreadProps['data'] | undefined;
  refreshControl: FlatListProps<CommentsThreadInternals.Item>['refreshControl'];
  onSubmit: CommentsThreadProps['onSubmit'] | undefined;

  // Actions
  setResourceId: (resourceId: CommentsThreadStore['resourceId']) => void;
  setData: (comments: CommentsThreadStore['data']) => void;
  setRefreshControl: (refreshControl: CommentsThreadStore['refreshControl']) => void;
  setOnSubmit: (onSubmit: CommentsThreadStore['onSubmit']) => void;
  // refresh: () => Promise<void>;
  clear: () => void;
}

const initialData: Pick<CommentsThreadStore, 'data' | 'resourceId' | 'refreshControl' | 'onSubmit'> = {
  data: undefined,
  onSubmit: undefined,
  refreshControl: undefined,
  resourceId: undefined,
};

export const useCommentsThreadStore = create<CommentsThreadStore>()(set => ({
  ...initialData,
  clear: () => set(initialData),
  setData: data => set({ data }),
  setOnSubmit: onSubmit => set({ onSubmit }),
  setRefreshControl: refreshControl => set({ refreshControl }),
  setResourceId: resourceId => set({ resourceId }),
}));
