/**
 * Competences Reducer
 */
import { combineReducers } from 'redux';

import { Reducers } from '~/app/store';
import { IClassGroups, ITerm } from '~/framework/modules/viescolaire/common/model';
import {
  IAverage,
  ICompetence,
  IDevoir,
  IDomaine,
  ILevel,
  ISubject,
  IUserChild,
} from '~/framework/modules/viescolaire/competences/model';
import moduleConfig from '~/framework/modules/viescolaire/competences/module-config';
import { AsyncState, createAsyncActionTypes, createSessionAsyncReducer } from '~/framework/util/redux/async';

interface ICompetencesReduxStateData {
  averages: IAverage[];
  classGroups: IClassGroups[];
  competences: ICompetence[];
  devoirs: IDevoir[];
  domaines: IDomaine[];
  levels: ILevel[];
  subjects: ISubject[];
  terms: ITerm[];
  userChildren: IUserChild[];
}

export interface ICompetencesReduxState {
  averages: AsyncState<IAverage[]>;
  classGroups: AsyncState<IClassGroups[]>;
  competences: AsyncState<ICompetence[]>;
  devoirs: AsyncState<IDevoir[]>;
  domaines: AsyncState<IDomaine[]>;
  levels: AsyncState<ILevel[]>;
  subjects: AsyncState<ISubject[]>;
  terms: AsyncState<ITerm[]>;
  userChildren: AsyncState<IUserChild[]>;
}

const initialState: ICompetencesReduxStateData = {
  averages: [],
  classGroups: [],
  competences: [],
  devoirs: [],
  domaines: [],
  levels: [],
  subjects: [],
  terms: [],
  userChildren: [],
};

export const actionTypes = {
  averages: createAsyncActionTypes(moduleConfig.namespaceActionType('AVERAGES')),
  classGroups: createAsyncActionTypes(moduleConfig.namespaceActionType('CLASS_GROUPS')),
  competences: createAsyncActionTypes(moduleConfig.namespaceActionType('COMPETENCES')),
  devoirs: createAsyncActionTypes(moduleConfig.namespaceActionType('DEVOIRS')),
  domaines: createAsyncActionTypes(moduleConfig.namespaceActionType('DOMAINES')),
  levels: createAsyncActionTypes(moduleConfig.namespaceActionType('LEVELS')),
  subjects: createAsyncActionTypes(moduleConfig.namespaceActionType('SUBJECTS')),
  terms: createAsyncActionTypes(moduleConfig.namespaceActionType('TERMS')),
  userChildren: createAsyncActionTypes(moduleConfig.namespaceActionType('USER_CHILDREN')),
};

const reducer = combineReducers({
  averages: createSessionAsyncReducer(initialState.averages, actionTypes.averages),
  classGroups: createSessionAsyncReducer(initialState.classGroups, actionTypes.classGroups),
  competences: createSessionAsyncReducer(initialState.competences, actionTypes.competences),
  devoirs: createSessionAsyncReducer(initialState.devoirs, actionTypes.devoirs),
  domaines: createSessionAsyncReducer(initialState.domaines, actionTypes.domaines),
  levels: createSessionAsyncReducer(initialState.levels, actionTypes.levels),
  subjects: createSessionAsyncReducer(initialState.subjects, actionTypes.subjects),
  terms: createSessionAsyncReducer(initialState.terms, actionTypes.terms),
  userChildren: createSessionAsyncReducer(initialState.userChildren, actionTypes.userChildren),
});
Reducers.register(moduleConfig.reducerName, reducer);
export default reducer;
