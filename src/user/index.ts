import { registerModule } from '~/AppModules';

import userConfig from './config';
import mainComp from './navigator';
import mainReducer from './reducers';

// Main component
export const root = mainComp;

// Reducer
export const reducer = mainReducer;

// Route
export const route = userConfig.createRoute(root);

const module = {
  reducer,
  root,
  route,
};
export default module;

registerModule({
  order: 5,
  config: require('./config').default,
  module,
});
