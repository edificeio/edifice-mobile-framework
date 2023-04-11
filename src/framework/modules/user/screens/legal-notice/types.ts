import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { IAuthState } from '~/framework/modules/auth/reducer';
import type { UserNavigationParams } from '~/framework/modules/user/navigation';

export interface UserLegalNoticeScreenProps {}

export interface UserLegalNoticeScreenNavParams {}

export interface UserLegalNoticeScreenStoreProps {
  urls: IAuthState['legalUrls'];
}

export interface UserLegalNoticeScreenDispatchProps {}

export interface UserLegalNoticeScreenPrivateProps
  extends NativeStackScreenProps<UserNavigationParams, 'legalNotice'>,
    UserLegalNoticeScreenProps,
    UserLegalNoticeScreenStoreProps,
    UserLegalNoticeScreenDispatchProps {}
