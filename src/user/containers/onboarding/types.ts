import { NavigationInjectedProps } from 'react-navigation';
import { ThunkDispatch } from 'redux-thunk';

export interface IOnboardingScreenProps extends NavigationInjectedProps<object> {
  dispatch: ThunkDispatch<any, any, any>;
}

export interface IOnboardingScreenState {
  buttonsWidth: number;
}
