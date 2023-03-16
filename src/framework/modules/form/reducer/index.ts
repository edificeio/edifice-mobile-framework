/**
 * Form Reducer
 */
import { combineReducers } from 'redux';

import { Reducers } from '~/app/store';
import { IFormData } from '~/framework/modules/form/model';
import moduleConfig from '~/framework/modules/form/module-config';
import { createAsyncActionTypes, createSessionAsyncReducer } from '~/framework/util/redux/async';

const initialState: IFormData = {
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
