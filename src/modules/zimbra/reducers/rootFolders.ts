import { createSessionAsyncReducer } from '~/infra/redux/async2';
import { initialState, actionTypesRootFolders } from '~/modules/zimbra/state/rootFolders';

// THE REDUCER ------------------------------------------------------------------------------------

export default createSessionAsyncReducer(initialState, actionTypesRootFolders);
