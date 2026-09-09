import { StyleProp, ViewStyle } from 'react-native';

import { AccountType } from '~/framework/modules/auth/model';

export interface AuthorLineProps {
  bold?: boolean;
  name: string;
  profile: AccountType;
  style?: StyleProp<ViewStyle>;
}
