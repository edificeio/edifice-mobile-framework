/**
 * Competences Reducer
 */
import { combineReducers } from 'redux';

import { Reducers } from '~/app/store';
import { IClassGroups, ITerm } from '~/framework/modules/viescolaire/common/model';
import { IDevoirsMatieres, ILevel, IMoyenne, IUserChild } from '~/framework/modules/viescolaire/competences/model';
import moduleConfig from '~/framework/modules/viescolaire/competences/module-config';
import { AsyncState, createAsyncActionTypes, createSessionAsyncReducer } from '~/framework/util/redux/async';

interface ICompetencesReduxStateData {
  classGroups: IClassGroups[];
  devoirsMatieres: IDevoirsMatieres;
  levels: ILevel[];
  moyennes: IMoyenne[];
  terms: ITerm[];
  userChildren: IUserChild[];
}

export interface ICompetencesReduxState {
  classGroups: AsyncState<IClassGroups[]>;
  devoirsMatieres: AsyncState<IDevoirsMatieres>;
  levels: AsyncState<ILevel[]>;
  moyennes: AsyncState<IMoyenne[]>;
  terms: AsyncState<ITerm[]>;
  userChildren: AsyncState<IUserChild[]>;
}

const initialState: ICompetencesReduxStateData = {
  classGroups: [],
  devoirsMatieres: {
    devoirs: [],
    matieres: [],
  },
  levels: [],
  moyennes: [],
  terms: [],
  userChildren: [],
};

export const actionTypes = {
  classGroups: createAsyncActionTypes(moduleConfig.namespaceActionType('CLASS_GROUPS')),
  devoirsMatieres: createAsyncActionTypes(moduleConfig.namespaceActionType('DEVOIRS_MATIERES')),
  levels: createAsyncActionTypes(moduleConfig.namespaceActionType('LEVELS')),
  moyennes: createAsyncActionTypes(moduleConfig.namespaceActionType('MOYENNES')),
  terms: createAsyncActionTypes(moduleConfig.namespaceActionType('TERMS')),
  userChildren: createAsyncActionTypes(moduleConfig.namespaceActionType('USER_CHILDREN')),
};

const reducer = combineReducers({
  classGroups: createSessionAsyncReducer(initialState.classGroups, actionTypes.classGroups),
  devoirsMatieres: createSessionAsyncReducer(initialState.devoirsMatieres, actionTypes.devoirsMatieres),
  levels: createSessionAsyncReducer(initialState.levels, actionTypes.levels),
  moyennes: createSessionAsyncReducer(initialState.moyennes, actionTypes.moyennes),
  terms: createSessionAsyncReducer(initialState.terms, actionTypes.terms),
  userChildren: createSessionAsyncReducer(initialState.userChildren, actionTypes.userChildren),
});

Reducers.register(moduleConfig.reducerName, reducer);

export default reducer;
