/**
 * Form Reducer
 */
import { combineReducers } from 'redux';

import { Reducers } from '~/app/store';
import { IDistribution, IForm, IFormContent, IGdprDelegate } from '~/framework/modules/form/model';
import moduleConfig from '~/framework/modules/form/module-config';
import { AsyncState, createAsyncActionTypes, createSessionAsyncReducer } from '~/framework/util/redux/async';

export interface IFormReduxState {
  distributions: AsyncState<IDistribution[]>;
  forms: AsyncState<IForm[]>;
  formContent: AsyncState<IFormContent>;
  gdprDelegates: AsyncState<IGdprDelegate[]>;
}

interface IFormReduxStateData {
  distributions: IDistribution[];
  forms: IForm[];
  formContent: IFormContent;
  gdprDelegates: IGdprDelegate[];
}

const initialState: IFormReduxStateData = {
  distributions: [],
  formContent: {
    elements: [],
    elementsCount: 0,
  },
  forms: [],
  gdprDelegates: [],
};

export const actionTypes = {
  content: createAsyncActionTypes(moduleConfig.namespaceActionType('CONTENT')),
  listDistributionsReceived: createAsyncActionTypes(moduleConfig.namespaceActionType('LIST_DISTRIBUTIONS_RECEIVED')),
  listFormsReceived: createAsyncActionTypes(moduleConfig.namespaceActionType('LIST_FORMS_RECEIVED')),
  listGdprDelegates: createAsyncActionTypes(moduleConfig.namespaceActionType('LIST_GDPR_DELEGATES')),
};

const reducer = combineReducers({
  distributions: createSessionAsyncReducer(initialState.distributions, actionTypes.listDistributionsReceived),
  formContent: createSessionAsyncReducer(initialState.formContent, actionTypes.content),
  forms: createSessionAsyncReducer(initialState.forms, actionTypes.listFormsReceived),
  gdprDelegates: createSessionAsyncReducer(initialState.gdprDelegates, actionTypes.listGdprDelegates),
});
Reducers.register(moduleConfig.reducerName, reducer);
export default reducer;
