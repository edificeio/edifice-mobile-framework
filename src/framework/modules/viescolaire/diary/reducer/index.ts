/**
 * Diary Reducer
 */
import { combineReducers } from 'redux';

import { Reducers } from '~/app/store';
import { IDiarySession, IHomeworkMap } from '~/framework/modules/viescolaire/diary/model';
import moduleConfig from '~/framework/modules/viescolaire/diary/module-config';
import { ISlot } from '~/framework/modules/viescolaire/edt/model';
import { AsyncState, createAsyncActionTypes, createSessionAsyncReducer } from '~/framework/util/redux/async';

interface IDiaryReduxStateData {
  homeworks: IHomeworkMap;
  sessions: IDiarySession[];
  slots: ISlot[];
}

export interface IDiaryReduxState {
  homeworks: AsyncState<IHomeworkMap>;
  sessions: AsyncState<IDiarySession[]>;
  slots: AsyncState<ISlot[]>;
}

const initialState: IDiaryReduxStateData = {
  homeworks: {},
  sessions: [],
  slots: [],
};

export const actionTypes = {
  homeworks: createAsyncActionTypes(moduleConfig.namespaceActionType('HOMEWORKS')),
  sessions: createAsyncActionTypes(moduleConfig.namespaceActionType('SESSIONS')),
  slots: createAsyncActionTypes(moduleConfig.namespaceActionType('TIME_SLOTS')),
  updateHomework: createAsyncActionTypes(moduleConfig.namespaceActionType('UPDATE_HOMEWORK')),
};

const homeworksActionHandler = {
  [actionTypes.updateHomework.receipt]: (state, action) => {
    const stateUpdated = Object.assign({}, state);
    if (stateUpdated[action.data.homeworkId].progress === null) stateUpdated[action.data.homeworkId].progress = {};
    stateUpdated[action.data.homeworkId].progress.state_label = action.data.status;
    stateUpdated[action.data.homeworkId].progress.state_id = action.data.status === 'todo' ? 1 : 2;
    action.data = stateUpdated;
    return { ...stateUpdated };
  },
};

const reducer = combineReducers({
  homeworks: createSessionAsyncReducer(initialState.homeworks, actionTypes.homeworks, homeworksActionHandler),
  sessions: createSessionAsyncReducer(initialState.sessions, actionTypes.sessions),
  slots: createSessionAsyncReducer(initialState.slots, actionTypes.slots),
});

Reducers.register(moduleConfig.reducerName, reducer);

export default reducer;
