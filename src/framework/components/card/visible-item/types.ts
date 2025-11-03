import { ViewStyle } from 'react-native';

import { Size } from '~/framework/components/avatar';

export interface VisibleItemProps {
  avatarSize?: Size | keyof typeof Size;
  backgroundColor?: ViewStyle['backgroundColor'];
  children: React.ReactNode;
  rightElement?: React.ReactNode;
  userId: string;
}

export type VisibleItemLoaderProps = Omit<VisibleItemProps, 'rightElement' | 'userId'>;
