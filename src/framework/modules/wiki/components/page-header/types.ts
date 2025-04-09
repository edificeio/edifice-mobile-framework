import { ViewProps } from 'react-native';

export enum HeaderStatus {
  VISIBLE = 'visible',
  HIDDEN = 'hidden',
}

export interface PageHeaderProps extends Pick<ViewProps, 'style'> {
  status?: HeaderStatus;
  children?: React.ReactNode;
}
