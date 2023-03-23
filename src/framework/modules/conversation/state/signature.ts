import signatureConfig from '~/framework/modules/conversation/module-config';
import { AsyncState, createAsyncActionTypes } from '~/infra/redux/async2';

// THE MODEL --------------------------------------------------------------------------------------

export interface ISignature {
  preference: {
    useSignature: boolean;
    signature: string;
  };
  id: string;
}

// THE STATE --------------------------------------------------------------------------------------

export type ISignatureState = AsyncState<ISignature>;

export const initialState: ISignature = {
  preference: {
    useSignature: false,
    signature: '',
  },
  id: '',
};

export const getSignatureState = (globalState: any) => signatureConfig.getState(globalState).signature as ISignatureState;

// THE ACTION TYPES -------------------------------------------------------------------------------

export const actionTypes = createAsyncActionTypes(signatureConfig.namespaceActionType('SIGNATURE'));
