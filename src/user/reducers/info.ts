import moment from 'moment';

import { createSessionReducer } from '~/infra/redux/reducerFactory';
import { actionTypeLoggedIn, actionTypeLoggedOut } from '~/user/actions/actionTypes/login';
import { actionTypeProfileUpdateSuccess, actionTypeProfileUpdateError } from '~/user/actions/profile';
import { initialState } from '~/user/state/info';

export default createSessionReducer(initialState, {
  [actionTypeLoggedIn]: (state, action) => ({
    ...initialState,
    ...action.userPublicInfo,
    ...action.userdata,
    ...action.userbook,
    birthDate: moment(action.userbook.birthDate),
    lastLogin: moment(action.userdata.lastLogin),
    modified: moment(action.userdata.modified),
  }),

  [actionTypeLoggedOut]: () => initialState, // ToDo : This is a session reducer. This is not required. Just need to flush session.

  [actionTypeProfileUpdateSuccess]: (state, action) => ({
    ...state,
    ...action.updatedProfileValues,
    modified: moment(),
  }),

  [actionTypeProfileUpdateError]: (state, action) => ({
    ...state,
    forceRefreshKey: state.forceRefreshKey + 1,
  }),
});
