import { combineReducers } from 'redux';

import { Reducers } from '~/app/store';
import { getFlattenedChildren } from '~/framework/modules/auth/model';
import { actionTypes as authActionTypes } from '~/framework/modules/auth/reducer';
import moduleConfig from '~/framework/modules/viescolaire/dashboard/module-config';
import { createSessionReducer } from '~/framework/util/redux/reducerFactory';
import { setItemJson } from '~/framework/util/storage';

export const getChildStorageKey = (userId: string) => `${moduleConfig.name}.selectedChildId.${userId}`;

export const getStructureStorageKey = (userId: string) => `${moduleConfig.name}.selectedStructureId.${userId}`;

interface IDashboardReduxStateData {
  selectedChildId: string;
  selectedStructureId: string;
}

export interface IDashboardReduxState {
  selectedChildId: string;
  selectedStructureId: string;
}

const initialState: IDashboardReduxStateData = {
  selectedChildId: '',
  selectedStructureId: '',
};

export const actionTypes = {
  selectChild: moduleConfig.namespaceActionType('SELECT_CHILD'),
  selectStructure: moduleConfig.namespaceActionType('SELECT_STRUCTURE'),
};

const reducer = combineReducers({
  selectedChildId: createSessionReducer(initialState.selectedChildId, {
    [authActionTypes.sessionCreate]: (state, action) => {
      const children = getFlattenedChildren(action.session.user.children);
      return children?.find(child => child.classesNames.length)?.id ?? null;
    },
    [actionTypes.selectChild]: (state, action) => {
      setItemJson<string>(getChildStorageKey(action.userId ?? 'global'), action.childId);
      return action.childId;
    },
  }),
  selectedStructureId: createSessionReducer(initialState.selectedStructureId, {
    [authActionTypes.sessionCreate]: (state, action) => {
      return action.session.user.structures[0]?.id;
    },
    [actionTypes.selectStructure]: (state, action) => {
      setItemJson<string>(getStructureStorageKey(action.userId ?? 'global'), action.structureId);
      return action.structureId;
    },
  }),
});
Reducers.register(moduleConfig.reducerName, reducer);
export default reducer;
