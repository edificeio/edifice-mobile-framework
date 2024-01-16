import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ThunkDispatch } from 'redux-thunk';

import { IAuthNavigationParams, authRouteNames } from '~/framework/modules/auth/navigation';

export interface IOnboardingScreenProps extends NativeStackScreenProps<IAuthNavigationParams, typeof authRouteNames.onboarding> {
  dispatch: ThunkDispatch<any, any, any>;
}

export interface IOnboardingScreenState {
  buttonsWidth: number;
}
