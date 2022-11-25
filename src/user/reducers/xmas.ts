import { createEndSessionActionType } from '~/infra/redux/reducerFactory';

export interface IXmasState {
  xmasTheme: boolean;
}

// THE REDUCER ------------------------------------------------------------------------------------

export const stateDefault: IXmasState = {
  xmasTheme: true,
};

const xmasReducer = (state: IXmasState = stateDefault, action): IXmasState => {
  switch (action.type) {
    case 'toggleXmasTheme':
      return {
        ...state,
        xmasTheme: action.xmasTheme,
      };
    // Session flush forward-compatibility.
    case createEndSessionActionType():
      return stateDefault;
    default:
      return state;
  }
};
export default xmasReducer;
