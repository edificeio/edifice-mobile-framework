import { createSessionAsyncReducer } from "../../../infra/redux/async2";
import { initialState, actionTypesRootFolders } from "../state/rootFolders";

// THE REDUCER ------------------------------------------------------------------------------------

export default createSessionAsyncReducer(initialState, actionTypesRootFolders);
