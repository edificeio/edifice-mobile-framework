import type { NativeStackScreenProps } from '@react-navigation/native-stack'

import { logoutAction } from '~/framework/modules/auth/actions'
import type { AuthRouteNames, IAuthNavigationParams } from '~/framework/modules/auth/navigation'
import { UpdatableProfileValues } from '~/framework/modules/user/actions'
import { ModificationType } from '~/framework/modules/user/screens/home/types'
import { Platform } from '~/framework/util/appConf'

export interface AuthChangeMobileScreenDispatchProps {
  onLogout: (...args: Parameters<typeof logoutAction>) => Promise<void>
  onSaveNewMobile(updatedProfileValues: UpdatableProfileValues): void
}

export interface AuthChangeMobileScreenNavParams {
  defaultMobile?: string
  modificationType?: ModificationType
  navBarTitle?: string
  platform: Platform
  rememberMe?: boolean
}

export interface AuthChangeMobileScreenProps {}

export interface AuthChangeMobileScreenStoreProps {}

export interface AuthChangeMobileScreenPrivateProps
  extends NativeStackScreenProps<IAuthNavigationParams, typeof AuthRouteNames.changeMobile>,
    AuthChangeMobileScreenProps,
    AuthChangeMobileScreenStoreProps,
    AuthChangeMobileScreenDispatchProps {}

export enum MobileState {
  MOBILE_ALREADY_VERIFIED = 'mobileAlreadyVerified',
  MOBILE_FORMAT_INVALID = 'mobileFormatInvalid',
  PRISTINE = 'pristine',
}
