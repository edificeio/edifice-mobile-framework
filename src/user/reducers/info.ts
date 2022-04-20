import moment from 'moment';

import { computeUserSession } from '~/framework/util/session';
import { createSessionReducer } from '~/infra/redux/reducerFactory';
import { actionTypeLoggedIn, actionTypeLoggedOut } from '~/user/actions/actionTypes/login';
import { actionTypeProfileUpdateError, actionTypeProfileUpdateSuccess } from '~/user/actions/profile';
import { initialState } from '~/user/state/info';

export default createSessionReducer(initialState, {
  [actionTypeLoggedIn]: (state, action) => {
    const ret = {
      ...initialState,
      ...action.userPublicInfo,
      ...action.userdata,
      ...action.userbook,
      birthDate: moment(action.userbook.birthDate),
      lastLogin: moment(action.userdata.lastLogin),
      modified: moment(action.userdata.modified),
    };
    computeUserSession(undefined, ret);
    return ret;
  },

  [actionTypeLoggedOut]: () => {
    computeUserSession(undefined, initialState);
    return initialState;
  }, // ToDo : This is a session reducer. This is not required. Just need to flush session.

  [actionTypeProfileUpdateSuccess]: (state, action) => {
    const ret = {
      ...state,
      ...action.updatedProfileValues,
      modified: moment(),
    };
    computeUserSession(undefined, ret);
    return ret;
  },

  [actionTypeProfileUpdateError]: (state, action) => ({
    ...state,
    forceRefreshKey: state.forceRefreshKey + 1,
  }),
});
