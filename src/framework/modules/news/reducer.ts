import { Reducers } from '~/app/store';
import { createSessionReducer } from '~/framework/util/redux/reducerFactory';

import moduleConfig from './module-config';

export interface NewsState {}

const initialState: NewsState = {};

const reducer = createSessionReducer(initialState, {
  // Add reducer functions here or use reducer tools
});
Reducers.register(moduleConfig.reducerName, reducer);
export default reducer;
