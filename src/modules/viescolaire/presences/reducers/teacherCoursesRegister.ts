import { createSessionAsyncReducer } from '~/infra/redux/async2';
import { actionTypesRegister, initialStateRegister } from '~/modules/viescolaire/presences/state/teacherCourses';

export default createSessionAsyncReducer(initialStateRegister, actionTypesRegister);
