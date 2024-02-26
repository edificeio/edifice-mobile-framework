import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { AuthNavigationParams } from '~/framework/modules/auth/navigation';

export interface AuthAddAccountModalScreenProps {
  // @scaffolder add props here
}

export interface AuthAddAccountModalScreenNavParams {
  // @scaffolder add nav params here
}

export interface AuthAddAccountModalScreenPrivateProps
  extends NativeStackScreenProps<AuthNavigationParams, 'addAccountModal'>,
    AuthAddAccountModalScreenProps {
  // @scaffolder add HOC props here
}
