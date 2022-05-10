import { createSessionAsyncReducer } from '~/infra/redux/async2';
import { actionTypes, initialStateRegister } from '~/modules/viescolaire/presences/state/teacherCourseRegister';

export default createSessionAsyncReducer(initialStateRegister, actionTypes);
