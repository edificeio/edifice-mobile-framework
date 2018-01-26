import { NavigationActions } from 'react-navigation';
import { getCurrentRouteName } from '../navigation';
import AppNavigator from '../navigation/AppNavigator';

const initialState = AppNavigator.router.getStateForAction(NavigationActions.init(), null);

export default function navigationReducer(
  state = initialState,
  action,
) {
    const nextState = AppNavigator.router.getStateForAction(action, state);
    return nextState || state;
}
