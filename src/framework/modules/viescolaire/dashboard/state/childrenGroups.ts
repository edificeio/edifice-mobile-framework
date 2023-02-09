import viescoConfig from '~/framework/modules/viescolaire/dashboard/module-config';
import { AsyncActionTypes, AsyncState, createAsyncActionTypes } from '~/infra/redux/async2';

// THE MODEL --------------------------------------------------------------------------------------

export interface IChildGroup {
  color: string;
  externalId: string;
  id: string;
  name: string;
  notEmptyClass: boolean;
  type_groupe: number;
}

export type IChildrenGroups = IChildGroup[];

// THE STATE --------------------------------------------------------------------------------------

export type IChildrenGroupsState = AsyncState<IChildrenGroups>;

export const initialState: IChildrenGroups = [];

export const getChildrenGroupsState = (globalState: any) =>
  viescoConfig.getState(globalState).childrenGroups as IChildrenGroupsState;

// THE ACTION TYPES -------------------------------------------------------------------------------

export const actionTypes: AsyncActionTypes = createAsyncActionTypes(viescoConfig.namespaceActionType('CHILDREN_GROUPS'));
