import { AsyncActionTypes, AsyncState, createAsyncActionTypes } from '~/infra/redux/async2';
import moduleConfig from '~/modules/viescolaire/presences/moduleConfig';

// THE MODEL --------------------------------------------------------------------------------------

export interface IUserChild {
  birth: string;
  displayName: string;
  firstName: string;
  id: string;
  lastName: string;
  structures: {
    classes: {
      id: string;
      name: string;
      structure: string;
    }[];
    id: string;
    name: string;
  }[];
}

export type IUserChildren = IUserChild[];

// THE STATE --------------------------------------------------------------------------------------

export type IPresencesUserChildrenState = AsyncState<IUserChildren>;

export const initialState: IUserChildren = [
  {
    birth: '',
    displayName: '',
    firstName: '',
    id: '',
    lastName: '',
    structures: [
      {
        classes: [
          {
            id: '',
            name: '',
            structure: '',
          },
        ],
        id: '',
        name: '',
      },
    ],
  },
];

export const getUserChildrenState = (globalState: any) =>
  moduleConfig.getState(globalState).userChildren as IPresencesUserChildrenState;

// THE ACTION TYPES -------------------------------------------------------------------------------

export const actionTypes: AsyncActionTypes = createAsyncActionTypes(moduleConfig.namespaceActionType('PRESENCES_USER_CHILDREN'));
