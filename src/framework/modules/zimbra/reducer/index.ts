import { combineReducers } from 'redux';

import { Reducers } from '~/app/store';
import { IFolder, IMail, IQuota, ISignature } from '~/framework/modules/zimbra/model';
import moduleConfig from '~/framework/modules/zimbra/module-config';
import { AsyncState, createAsyncActionTypes, createSessionAsyncReducer } from '~/framework/util/redux/async';

interface IZimbraReduxStateData {
  mail?: IMail;
  mails: Omit<IMail, 'body'>[];
  quota: IQuota;
  rootFolders: IFolder[];
  signature: ISignature;
}

export interface IZimbraReduxState {
  mail: AsyncState<IMail | undefined>;
  mails: AsyncState<Omit<IMail, 'body'>[]>;
  quota: AsyncState<IQuota>;
  rootFolders: AsyncState<IFolder[]>;
  signature: AsyncState<ISignature>;
}

const initialState: IZimbraReduxStateData = {
  mails: [],
  quota: {
    storage: 0,
    quota: 0,
  },
  rootFolders: [],
  signature: {
    preference: {
      useSignature: false,
      signature: '',
    },
    zimbraENTSignatureExists: false,
    id: '',
  },
};

export const actionTypes = {
  mail: createAsyncActionTypes(moduleConfig.namespaceActionType('MAIL')),
  mailList: createAsyncActionTypes(moduleConfig.namespaceActionType('MAIL_LIST')),
  quota: createAsyncActionTypes(moduleConfig.namespaceActionType('QUOTA')),
  rootFolders: createAsyncActionTypes(moduleConfig.namespaceActionType('ROOT_FOLDERS')),
  signature: createAsyncActionTypes(moduleConfig.namespaceActionType('SIGNATURE')),
};

const reducer = combineReducers({
  mail: createSessionAsyncReducer(initialState.mail, actionTypes.mail),
  mails: createSessionAsyncReducer(initialState.mails, actionTypes.mailList),
  quota: createSessionAsyncReducer(initialState.quota, actionTypes.quota),
  rootFolders: createSessionAsyncReducer(initialState.rootFolders, actionTypes.rootFolders),
  signature: createSessionAsyncReducer(initialState.signature, actionTypes.signature),
});
Reducers.register(moduleConfig.reducerName, reducer);
export default reducer;
