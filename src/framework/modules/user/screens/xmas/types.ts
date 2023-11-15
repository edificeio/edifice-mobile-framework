import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { UserNavigationParams } from '~/framework/modules/user/navigation';

export interface UserXmasScreenProps {}

export interface UserXmasScreenNavParams {}

export interface UserXmasScreenStoreProps {
  xmasTheme: boolean;
}

export interface UserXmasScreenDispatchProps {
  onSetXmasTheme: (xmasTheme: boolean) => void;
}

export interface UserXmasScreenPrivateProps
  extends NativeStackScreenProps<UserNavigationParams, 'xmas'>,
    UserXmasScreenProps,
    UserXmasScreenStoreProps,
    UserXmasScreenDispatchProps {}
