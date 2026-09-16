import { FlatListProps } from 'react-native';

import { create } from 'zustand';

import { CommentsThreadInternals, CommentsThreadProps } from './components/comments-thread';

interface CommentsThreadStore {
  // data
  data: CommentsThreadProps['data'] | undefined;
  refreshControl: FlatListProps<CommentsThreadInternals.Item>['refreshControl'];
  onSubmit: CommentsThreadProps['onSubmit'] | undefined;
  onDelete: CommentsThreadProps['onDelete'] | undefined;
  onEdit: CommentsThreadProps['onEdit'] | undefined;

  // Actions
  setData: (comments: CommentsThreadStore['data']) => void;
  setRefreshControl: (refreshControl: CommentsThreadStore['refreshControl']) => void;
  setCallbacks: (
    onSubmit: CommentsThreadStore['onSubmit'],
    onEdit: CommentsThreadStore['onEdit'],
    onDelete: CommentsThreadStore['onDelete'],
  ) => void;
  // refresh: () => Promise<void>;
  clear: () => void;
}

const initialData: Pick<CommentsThreadStore, 'data' | 'refreshControl' | 'onSubmit' | 'onEdit' | 'onDelete'> = {
  data: undefined,
  onDelete: undefined,
  onEdit: undefined,
  onSubmit: undefined,
  refreshControl: undefined,
};

export const useCommentsThreadStore = create<CommentsThreadStore>()(set => ({
  ...initialData,
  clear: () => set(initialData),
  setCallbacks: (onSubmit, onEdit, onDelete) => set({ onDelete, onEdit, onSubmit }),
  setData: data => set({ data }),
  setRefreshControl: refreshControl => set({ refreshControl }),
}));
