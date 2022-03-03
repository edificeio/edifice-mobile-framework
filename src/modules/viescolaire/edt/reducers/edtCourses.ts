import { createSessionAsyncReducer } from '~/infra/redux/async2';
import { initialState, actionTypes } from '~/modules/viescolaire/edt/state/edtCourses';

export default createSessionAsyncReducer(initialState, actionTypes);
