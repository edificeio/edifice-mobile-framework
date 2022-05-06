import { IGlobalState } from '~/AppStore';
import {
  AsyncState,
  createAsyncActionCreators,
  createAsyncActionTypes,
  createSessionAsyncReducer,
} from '~/framework/util/redux/async';
import moduleConfig from '~/modules/pronote/moduleConfig';

import { ICarnetDeBord } from '.';

export type ICarnetDeBord_State_Data = ICarnetDeBord[];
export type ICarnetDeBord_State = AsyncState<ICarnetDeBord_State_Data>;

const initialState: ICarnetDeBord_State_Data = [];

export const actionTypes = createAsyncActionTypes(moduleConfig.namespaceActionType('CARNET_DE_BORD'));
export const actions = createAsyncActionCreators<ICarnetDeBord_State_Data>(actionTypes);

export default createSessionAsyncReducer(initialState, actionTypes);

export const getCarnetDeBordState = (globalState: IGlobalState) => moduleConfig.getState(globalState).carnetDeBord;
