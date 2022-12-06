import { createEndSessionActionType } from '~/infra/redux/reducerFactory';

export interface IXmasState {
  xmasTheme?: boolean;
  flakesFaling: boolean;
}

// THE REDUCER ------------------------------------------------------------------------------------

export const stateDefault: IXmasState = {
  xmasTheme: undefined,
  flakesFaling: false,
};

const xmasReducer = (state: IXmasState = stateDefault, action): IXmasState => {
  switch (action.type) {
    case 'toggleXmasTheme':
      return {
        ...state,
        xmasTheme: action.value,
      };
    case 'setFlakes':
      return {
        ...state,
        flakesFaling: action.value,
      };
    // Session flush forward-compatibility.
    case createEndSessionActionType():
      return stateDefault;
    default:
      return state;
  }
};
export default xmasReducer;
