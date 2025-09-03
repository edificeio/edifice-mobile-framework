import { ImageURISource } from 'react-native';

import { AuthActiveAccount } from '~/framework/modules/auth/model';

export enum AvatarSize {
  sm = 'sm',
  md = 'md',
  lg = 'lg',
  xl = 'xl',
  xxl = 'xxl',
}

export interface NewAvatarProps {
  source?: ImageURISource;
  userId?: string;
  session?: AuthActiveAccount;
  size?: AvatarSize;
  border?: boolean;
  onPress?: () => void;
}
