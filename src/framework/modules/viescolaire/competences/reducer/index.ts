/**
 * Competences Reducer
 */
import { combineReducers } from 'redux';

import { Reducers } from '~/app/store';
import { IDevoirsMatieres, ILevel, IMoyenne, IUserChild } from '~/framework/modules/viescolaire/competences/model';
import moduleConfig from '~/framework/modules/viescolaire/competences/module-config';
import { AsyncState, createAsyncActionTypes, createSessionAsyncReducer } from '~/framework/util/redux/async';

interface ICompetencesReduxStateData {
  devoirsMatieres: IDevoirsMatieres;
  levels: ILevel[];
  moyennes: IMoyenne[];
  userChildren: IUserChild[];
}

export interface ICompetencesReduxState {
  devoirsMatieres: AsyncState<IDevoirsMatieres>;
  levels: AsyncState<ILevel[]>;
  moyennes: AsyncState<IMoyenne[]>;
  userChildren: AsyncState<IUserChild[]>;
}

const initialState: ICompetencesReduxStateData = {
  devoirsMatieres: {
    devoirs: [],
    matieres: [],
  },
  levels: [],
  moyennes: [],
  userChildren: [],
};

export const actionTypes = {
  devoirsMatieres: createAsyncActionTypes(moduleConfig.namespaceActionType('DEVOIRS_MATIERES')),
  levels: createAsyncActionTypes(moduleConfig.namespaceActionType('LEVELS')),
  moyennes: createAsyncActionTypes(moduleConfig.namespaceActionType('MOYENNES')),
  userChildren: createAsyncActionTypes(moduleConfig.namespaceActionType('USER_CHILDREN')),
};

const reducer = combineReducers({
  devoirsMatieres: createSessionAsyncReducer(initialState.devoirsMatieres, actionTypes.devoirsMatieres),
  levels: createSessionAsyncReducer(initialState.levels, actionTypes.levels),
  moyennes: createSessionAsyncReducer(initialState.moyennes, actionTypes.moyennes),
  userChildren: createSessionAsyncReducer(initialState.userChildren, actionTypes.userChildren),
});

Reducers.register(moduleConfig.reducerName, reducer);

export default reducer;
