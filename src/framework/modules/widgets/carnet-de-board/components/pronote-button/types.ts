import type { StyleProp, ViewStyle } from 'react-native';

import type { AuthActiveAccount } from '~/framework/modules/auth/model';

export interface CarnetDeBordPronoteButtonProps {
  address?: string;
  pageId?: string;
  session: AuthActiveAccount;
  style?: StyleProp<ViewStyle>;
}
