import { IGlobalState } from '~/app/store';
import { ICarnetDeBord } from '~/framework/modules/pronote/model/carnet-de-bord';
import moduleConfig from '~/framework/modules/pronote/module-config';
import {
  AsyncState,
  createAsyncActionCreators,
  createAsyncActionTypes,
  createSessionAsyncReducer,
} from '~/framework/util/redux/async';

export type ICarnetDeBordStateData = ICarnetDeBord[];
export type ICarnetDeBordState = AsyncState<ICarnetDeBordStateData>;

const initialState: ICarnetDeBordStateData = [];

export const actionTypes = createAsyncActionTypes(moduleConfig.namespaceActionType('CARNET_DE_BORD'));
export const actions = createAsyncActionCreators<ICarnetDeBordStateData>(actionTypes);

export default createSessionAsyncReducer(initialState, actionTypes);

export const getCarnetDeBordState = (globalState: IGlobalState) => moduleConfig.getState(globalState).carnetDeBord;
