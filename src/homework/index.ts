import { registerModule } from '~/AppModules';
import { timelineSubModules } from '~/framework/modules/timelinev2/timelineModules';

import homeworkConfig from './config';
import mainComp, { homeworkViews } from './navigator';
import mainReducer from './reducers';

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

timelineSubModules.register(homeworkViews);
