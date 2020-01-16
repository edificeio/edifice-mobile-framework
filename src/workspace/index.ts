import config from "./config";

import mainComp from "./navigator";
import mainReducer from "./reducers";

// Main component
export const root = mainComp;

// Reducer
export const reducer = mainReducer;

// Route
export const route = config.createRoute(root);

export default {
  reducer,
  root,
  route,
};
