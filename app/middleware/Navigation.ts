import {NavigationActions} from 'react-navigation'
import {CREATE_ERROR, CREATE_SUCCESS} from '../constants/docs'
import {NAVIGATE, PATH_RECOVER_PASSWORD, PATH_SIGNUP, PATH_LOGOUT, PATH_LOGIN} from '../constants/paths'

import {navigatorRef} from '../components/AppScreen';

export default store => next => action => {
    const returnValue = next(action)

    if (
        action.path &&
        (action.path === PATH_LOGIN || action.path === PATH_SIGNUP) &&
        action.type === CREATE_SUCCESS
    ) {
        navigatorRef.dispatch(NavigationActions.navigate({routeName: 'Main'}))
    }

    if (
        action.path &&
        (action.path === PATH_LOGIN || action.path === PATH_SIGNUP) &&
        action.type === CREATE_ERROR
    ) {
        navigatorRef.dispatch(NavigationActions.navigate({routeName: 'Login'}))
    }

    // The auth flow should be refactored...Going back to login is a nightmare...
    if (
        action.path && action.path === PATH_RECOVER_PASSWORD &&
        action.type === CREATE_SUCCESS
    ) {
        navigatorRef.dispatch(NavigationActions.navigate({routeName: 'Login'}))
    }

    if (action.path && action.path === PATH_LOGOUT) {
        navigatorRef.dispatch(NavigationActions.navigate({routeName: 'Login'}))
    }

    if (action.type && action.type === NAVIGATE) {
        navigatorRef.dispatch(NavigationActions.navigate({routeName: action.screen}));
    }

    return returnValue
}