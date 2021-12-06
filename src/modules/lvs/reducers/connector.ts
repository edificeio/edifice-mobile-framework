/**
 * LVS state reducer
 * Manage loading of connector linking
 */
import { actionTypes } from '~/modules/lvs/actions/connector';

// TYPE DEFINITIONS -------------------------------------------------------------------------------

export interface IConnectorState {
  isConnecting: boolean;
  errmsg: string;
}

const stateDefault: IConnectorState = {
  isConnecting: false,
  errmsg: '',
};

// THE REDUCER ------------------------------------------------------------------------------------

const reducer: (state: IConnectorState, action: { type: string; errmsg: string }) => IConnectorState = (
  state = stateDefault,
  action,
) => {
  switch (action.type) {
    case actionTypes.error:
      return {
        isConnecting: false,
        errmsg: action.errmsg,
      };
    case actionTypes.connecting:
      return {
        isConnecting: true,
        errmsg: '',
      };
    case actionTypes.connected:
      return stateDefault;
    default:
      return state;
  }
};

export default reducer;
