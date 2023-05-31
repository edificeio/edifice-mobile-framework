/**
 * Form Reducer
 */
import { combineReducers } from 'redux';

import { Reducers } from '~/app/store';
import { IDistribution, IForm, IFormContent } from '~/framework/modules/form/model';
import moduleConfig from '~/framework/modules/form/module-config';
import { AsyncState, createAsyncActionTypes, createSessionAsyncReducer } from '~/framework/util/redux/async';

export interface IFormReduxState {
  distributions: AsyncState<IDistribution[]>;
  forms: AsyncState<IForm[]>;
  formContent: AsyncState<IFormContent>;
}

interface IFormReduxStateData {
  distributions: IDistribution[];
  forms: IForm[];
  formContent: IFormContent;
}

const initialState: IFormReduxStateData = {
  distributions: [],
  forms: [],
  formContent: {
    elements: [],
    elementsCount: 0,
  },
};

export const actionTypes = {
  content: createAsyncActionTypes(moduleConfig.namespaceActionType('CONTENT')),
  listDistributionsReceived: createAsyncActionTypes(moduleConfig.namespaceActionType('LIST_DISTRIBUTIONS_RECEIVED')),
  listFormsReceived: createAsyncActionTypes(moduleConfig.namespaceActionType('LIST_FORMS_RECEIVED')),
};

const reducer = combineReducers({
  distributions: createSessionAsyncReducer(initialState.distributions, actionTypes.listDistributionsReceived),
  forms: createSessionAsyncReducer(initialState.forms, actionTypes.listFormsReceived),
  formContent: createSessionAsyncReducer(initialState.formContent, actionTypes.content),
});
Reducers.register(moduleConfig.reducerName, reducer);
export default reducer;
