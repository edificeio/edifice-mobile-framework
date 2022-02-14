import { createSessionAsyncReducer } from '~/infra/redux/async2';
import { initialStateRegister, actionTypes } from '~/modules/viescolaire/presences/state/teacherCourseRegister';

export default createSessionAsyncReducer(initialStateRegister, actionTypes);
