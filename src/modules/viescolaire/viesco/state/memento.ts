import viescoConfig from '../../moduleConfig';

import { createAsyncActionTypes, AsyncState } from '~/infra/redux/async2';

// THE MODEL --------------------------------------------------------------------------------------

export interface IRelativesInfos {
  id: string;
  title: string;
  name: string;
  mobile: string;
  phone: string;
  address: string;
  email: string;
  activated: boolean;
  primary: boolean;
}

export interface IMemento {
  id: string;
  name: string;
  birth_date: string;
  classes: string[];
  groups: string[];
  comment: string;
  accommodation: string;
  relatives: IRelativesInfos[];
}

// THE STATE --------------------------------------------------------------------------------------

export type IMementoState = AsyncState<IMemento>;

export const initialState: IMemento = {
  id: '',
  name: '',
  birth_date: '',
  classes: [],
  groups: [],
  comment: '',
  accommodation: '',
  relatives: [],
};

export const getMementoState = (globalState: any) =>
  viescoConfig.getState(globalState).viesco.memento as IMementoState;

// THE ACTION TYPES -------------------------------------------------------------------------------

export const actionTypes = createAsyncActionTypes(viescoConfig.namespaceActionType('MEMENTO'));
