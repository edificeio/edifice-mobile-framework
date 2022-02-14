import { createAsyncActionTypes, AsyncState } from '~/infra/redux/async2';
import quotaConfig from '~/modules/zimbra/moduleConfig';

// THE MODEL --------------------------------------------------------------------------------------

export interface IQuota {
  storage: number;
  quota: string;
}

// THE STATE --------------------------------------------------------------------------------------

export type IQuotaState = AsyncState<IQuota>;

export const initialState: IQuota = {
  storage: 0,
  quota: '1',
};

export const getQuotaState = (globalState: any) => quotaConfig.getState(globalState).quota as IQuotaState;

// THE ACTION TYPES -------------------------------------------------------------------------------

export const actionTypes = createAsyncActionTypes(quotaConfig.namespaceActionType('QUOTA'));
