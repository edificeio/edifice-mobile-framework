import { createSessionAsyncReducer } from '~/infra/redux/async2';
import { actionTypesRootFolders, initialState } from '~/modules/zimbra/state/rootFolders';

// THE REDUCER ------------------------------------------------------------------------------------

export default createSessionAsyncReducer(initialState, actionTypesRootFolders);
