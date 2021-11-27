import homeworkConfig from './config';
import mainComp from './navigator';
import mainReducer from './reducers';

import { registerModule } from '~/AppModules';

// Main component
export const root = mainComp;

// Reducer
export const reducer = mainReducer;

// Route
export const route = homeworkConfig.createRoute(root);

const module = {
  reducer,
  root,
  route,
};
export default module;

registerModule({
  order: 4,
  config: require('./config').default,
  module,
});
